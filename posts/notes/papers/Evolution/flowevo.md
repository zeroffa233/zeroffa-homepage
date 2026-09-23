---
title: "FlowEvo: Self-Evolving Agents through the Co-Evolution of Workflows and Executable Skills"
publishedAt: 2026-07
---

**Abstract:** Large language model agents can adapt to complex tasks by constructing workflows at inference time, but procedures discovered in one episode are usually discarded after execution. Existing skill libraries provide reusable executable routines, but are typically assembled offline and do not grow from the agent's own workflows. We introduce FlowEvo, a training-free framework in which workflows and skills co-evolve at inference time. FlowEvo compiles successful workflows into callable skills, stores them in a persistent bank, and uses retrieved skills either through direct execution or as context for constructing new workflows. It also tracks each skill's downstream utility and suppresses skills that cause negative transfer.
### 一、背景与任务 Setting

- **研究领域**：LLM Agent 的推理时（inference-time）自进化，属于 training-free adaptation。它与三条线相交：workflow 生成与优化、agent 记忆、tool/skill 库。
- **背景**：
    - 当前 LLM agent 越来越多地在推理时动态构建 workflow，包括任务分解、工具调用、代码生成、中间检查和修复，而不是走固定 prompt 或固定工具链。
    - 问题在于，一次 episode 中摸索出的有效流程会随轨迹一起被丢弃。agent 在相似任务上反复"重新发明"同样的流程，推高 token 成本，也增加结果方差。
- **任务 Setting**：
    - 面对一个任务流 {xt}t=1T\{x_t\}_{t=1}^T {xt​}t=1T​，base model 参数始终固定。
    - 第 t 个 episode 的上下文为 Ct=(Bt,Mt,Rt)C_t=(B_t, M_t, R_t) Ct​=(Bt​,Mt​,Rt​)，分别是可执行 skill bank、辅助记忆，以及检索/路由/失败状态。
    - 每步依次执行：生成 workflow Wt=G(xt;Ct)W_t=G(x_t;C_t) Wt​=G(xt​;Ct​) → 执行并验证得到轨迹与结果 (τt,yt)(\tau_t,y_t) (τt​,yt​) → 更新记忆状态（论文式 1）。
    - 自进化只通过记忆层的更新实现，不涉及任何梯度更新。
- **研究目的**：回答两个问题。第一，成功的 workflow 应当如何转化为可复用的 skill？第二，这些 skill 应当如何影响后续 workflow 的构建？

---

### 二、研究动机：已有方案的缺陷

作者把现有工作归为两条互相割裂的路线，而成功的 workflow 恰好处在两者之间。

|路线|代表工作|优点|核心缺陷|
|---|---|---|---|
|文本记忆|AWM、ExpeL、Self-Gen ICE|能描述"过去什么方法有效"|不可调用、不可验证，复用时仍需模型重新推导整个流程|
|可执行工具/skill 库|CREATOR、CRAFT、TroVE、Voyager、SkillWeaver 等|可调用、可检查|多为离线构建、面向固定任务分布，与 agent 自身的解题过程脱节|
|Workflow 优化|ADAS、AFlow、MermaidFlow、EvoAgentX 等|证明了 workflow 结构的重要性|只针对当前任务或 benchmark 做优化，学到的东西不以可执行形式保留|
|自进化方法|Promptbreeder、STOP、CLIN 等|training-free|缺乏具体的"能力积累"机制|

- **作者的核心判断**：
    - 成功的 workflow 比文本记忆包含更多可执行结构，又比人工设计的工具更灵活。
    - 因此它天然适合作为 skill 的来源，但目前没有方法把它在线沉淀下来。
- **为什么值得解决**：
    - 可以减少重复探索，从而降低 token 成本和方差。
    - skill 自带接口、测试和使用历史，具备可审计、可验证的特性。
- **额外关注的问题：负迁移**。
    - skill 积累并非总是有益。不好的 skill 被反复检索会持续伤害后续任务。
    - 因此需要一个"会自我淘汰"的生命周期管理机制。

---

### 三、方法

![[Pasted image 20260923151235.png]]

整体框架如图 1 所示：成功的 workflow 经"执行 → 验证 → 成功轨迹"后被编译为 skill 进入 bank；bank 中的 skill 再通过检索与路由，反哺后续 workflow 的生成。

#### 3.1 系统组成

- 系统由四个耦合组件构成：
    - workflow planner（规划器）；
    - 带验证的 executor（执行器）；
    - trace-to-skill compiler（轨迹到 skill 的编译器）；
    - 带生命周期管理的 skill registry（skill 注册表）。
- 完整的单 episode 流程见附录 Algorithm 1：检索 → 路由 → 生成或调用 → 执行验证 → 成功则编译并准入 → 更新统计 → curation。

#### 3.2 Skill 的表示

- 每个 skill 表示为五元组 s=(f,σ,T,m,ℓ)s=(f,\sigma,\mathcal{T},m,\ell) s=(f,σ,T,m,ℓ)：
    - ff f：可执行体，带明确的入口；
    - σ\sigma σ：显式的调用接口；
    - T\mathcal{T} T：replay 测试或验证测试；
    - mm m：元数据，包括来源、任务模式标签、是否允许直接复用、首选使用方式、负面证据等；
    - ℓ\ell ℓ：生命周期状态（active / suppressed / shadow）。
- **关键设计：同一个 artifact 支持两种用法**。
    - 直接执行：依赖接口、前置条件和 replay 证据。
    - 作为上下文：只暴露一个紧凑视图，例如签名、任务模式、脚手架提示或短代码片段。
    - 两种用法对可靠性的要求不同，因此在分析中分开评估。
- **ALFWorld 上的具体实现是三层结构**（附录 F）：
    - Layer-1 template：参数化的动作序列，例如 `go to {heating_station}` → `heat {object}...`，运行时通过解析任务目标来绑定槽位；
    - Layer-2 guideline：由 LLM 从成功轨迹中抽取 3–5 条抽象规则；
    - Layer-3 insight：跨轨迹聚合得到的环境先验，例如搜索优先级、常见陷阱。

#### 3.3 检索与三级路由（Tiered Reuse）

- **检索打分**综合四类信号：词汇重叠、任务模式兼容性、接口兼容性、历史效用。此外会对负面证据降权，避免有害的 skill 被当作"新候选"反复召回。
- **三种路由**（见表 13）：

|路由|检索到的 skill 起什么作用|何时使用|
|---|---|---|
|Dynamic generation|不使用 skill|没有可用检索结果|
|Direct skill execution|作为子程序直接调用|通过兼容性过滤和验证，复用足够可靠时|
|Skill-conditioned generation|只作为结构化上下文，辅助规划和生成|检索结果有参考价值，但不够可靠，不宜直接执行|

- **回退机制**：直接执行时如果前置条件或验证失败，会回退到 skill-conditioned 模式。
- 作者强调，区分"直接复用"和"条件化生成"很重要：性能提升不应被简单归结为"重放已存储的答案"。

#### 3.4 编译：从成功 workflow 到 skill

- 只对通过验证器的成功 episode 进行编译。
- 编译内容包括：识别入口、推断函数签名、抽取 replay 测试、记录来源与任务模式标签，以及路由所需的元数据。
- 编译产物交给准入层处理，有三种去向：
    - 保留，允许直接执行；
    - 保留，但只作为上下文使用；
    - 放入 shadow 状态，仅用于诊断。

#### 3.5 准入与生命周期管理（Contrastive-Utility Lifecycle）

- **准入**：先查重，再按三个维度检查。
    - 接口合规：能否按预定签名和前置条件被调用；
    - 功能正确：replay 测试是否通过；
    - 安全合规：是否违反禁用规则，例如禁止导入 os/subprocess 等模块，禁止调用 eval/exec 等函数。
- **上线后的持续管理**：
    - 下游效用无法在准入时评估，因此需要持续追踪。
    - 策略偏保守：先对可疑 skill 做定向审计，再降低其直接执行权限，最后才删除。
- **核心机制：对比评估（contrastive evaluation）**
    - 对每个活跃的 skill，比较"使用该 skill 的 episode"与"匹配的、未使用该 skill 的 episode"之间的成功率差 Δ。
    - 触发 suppression 的条件：Δ < −0.1，且至少有 5 个 guided 样本和 3 个 unguided 样本。
    - 作者认为这是一种轻量的因果信号：不需要显式的 holdout 实验，也不需要为单个 skill 标注贡献。

#### 3.6 代码与数学任务上的补充机制

- 在代码和数学任务上使用 adaptive escalation（自适应升级），共四级：
    - L1：贪心生成；
    - L2：2 候选的小型 ensemble；
    - L3、L4：两种温度下的重试。
- 只有前一级未通过验证时才升级到更昂贵的策略。这与 skill 编译机制配合使用。

---

### 四、实验

#### 4.1 实验设置

- **硬件**：论文未明确说明。所有方法均通过统一的 API endpoint 调用模型。
- **数据集**：两类任务、五个 benchmark，均使用完整标准划分。
    - 交互环境：ALFWorld，使用 eval_out_of_distribution 的 134 个任务，涵盖 6 类任务，每个任务最多 50 步，只有二值的终局成功信号。
    - 代码与数学：HumanEval（164 题）、MBPP（500 题）、GSM8K（1319 题）、MATH-500（500 题）。
- **Baseline**（共 8 个）：
    - 经验学习类：ExpeL、Self-Gen ICE；
    - workflow 优化类：ADAS、AFlow、MermaidFlow、EvoAgentX、DyFlow、ORCH。
    - 所有 baseline 均使用官方代码的默认配置，并匹配优化预算。
- **Backbone**：统一使用 GPT-4o-mini。另在 10 个模型上做了鲁棒性测试。
- **评价指标**：
    - 准确率：ALFWorld 为 success rate，HumanEval/MBPP 为 pass@1，GSM8K/MATH-500 为 solve rate；
    - 成本：每个任务的平均 token 数。
- **其他设置**：
    - 每个 benchmark 都从空 bank 独立开始，不做跨 benchmark 的迁移；
    - ALFWorld 与 MATH-500 使用 3 个 seed；
    - 配对比较使用 McNemar 检验。

#### 4.2 主结果（如表 1、表 2）

|Benchmark|FlowEvo|最强 baseline|提升|token 情况|
|---|---|---|---|---|
|ALFWorld|85.6|AFlow 59.2|+26.4|9,329，约为 baseline 的 1/3|
|HumanEval|95.1|ExpeL 89.0|+6.1|880，与 ExpeL 持平|
|MBPP|79.6|ExpeL 73.8|+5.8|2,230，高于 ExpeL|
|GSM8K|97.1|ORCH 93.9|+3.2|541，最低|
|MATH-500|75.9|EvoAgentX 73.6|+2.3|1,532，高于 ExpeL|

- **Insight 1：收益来源因任务类型而异。**
    - ALFWorld 上提升最大，因为 6 类任务以参数化变体的形式反复出现，编译得到的模板可以直接重放。
    - 代码和数学题几乎每题都不同，直接复用的贡献很小，收益主要来自 adaptive escalation 和 skill-conditioned 生成。
- **Insight 2：各 baseline 只在自己的"设计舒适区"内有效。**
    - ExpeL 在代码和数学上有竞争力，但在 ALFWorld 上只有 46.3。文本形式的 insight 无法重放参数化的动作序列。
    - AFlow 和 ADAS 在 HumanEval 上达到 87% 左右，但在 ALFWorld 上只有 53%–59%。单一优化后的拓扑无法覆盖 6 类任务。
    - FlowEvo 的两种复用模式恰好覆盖了这两种情形。

#### 4.3 跨模型鲁棒性（如表 3）

- 在 10 个模型（7B–671B，dense 与 MoE 均有）× 5 个数据集，共 50 个组合中，FlowEvo 在 49 个上优于 ExpeL，平均提升 +11.0，中位数 +7.0。
- **模型越小，收益越大**：在 GPT-4.1 nano/mini/full 的尺度梯度上，ALFWorld 的提升依次为 +53.2、+29.4、+21.3。
    - 作者的解释：编译得到的 skill 补上了弱模型缺失的结构，而强模型本身能按需重建这些结构。
- **唯一的反例**：Qwen3-8B 在 MATH-500 上为 −10.0。
    - 原因是小模型生成的 skill 大量违反接口约定，在准入阶段被拒，导致 bank 过于稀疏。
    - 这说明该框架需要 base model 具备一定的"启动能力"。

#### 4.4 消融实验（如表 4，ALFWorld）

|阶段|新增机制|成功率|增量|
|---|---|---|---|
|1|ReAct（无 bank）|33.6|—|
|2|+ 编译（只存储，不复用）|38.8|+5.2|
|3|+ skill → workflow 反馈|80.6|+41.8|
|4|+ curation（生命周期管理）|85.6|+5.0|

- 主要贡献来自 skill 反馈。
- 只编译不复用也有 +5.2 的提升。作者的解释是抽取可复用结构会改进辅助记忆，起到正则化作用，但这一解释偏定性。
- **Curation 的案例**：`pick_two_obj_and_place` 这个 skill 在使用时成功率为 2/14，不使用时为 1/3，Δ = −0.19，因此被 suppress，该类任务之后回退到动态生成。
- **对噪声的鲁棒性**（如表 10）：
    - 去掉"必须是成功轨迹才编译"的要求：−1.5；
    - 随机翻转 20% 的成功/失败标签：−1.7；
    - 两者都不显著（p > 0.1）。作者归因于"编译时验证 + 使用时对比检查"的两阶段设计。
- **Bank 规模**：最终稳定在 7 个模板和 18 个 exemplar，前 28 个 episode 就已覆盖 5 类任务（如表 11）。

#### 4.5 积累动态分析

![[Pasted image 20260923151317.png]]

- **Token 与复用曲线**：
    - 约在第 10 个 episode 首次复用 skill 后，token 消耗骤降。
    - 直接复用累计 101/134 次，命中率稳定在约 75%，复用 episode 的成功率为 98%。
- **分任务类型分析**（如图 3 、表 16）：
    - 收益与"直接命中率"近似单调相关：从命中率 83% 时的 +78，到命中率 0% 时的 +28。
    - `look_at_obj_in_light` 类任务从未通过直接执行完成，仍有 +28 的提升，说明 skill-conditioned 模式确实独立起作用。
- **MBPP 冻结 bank 实验**（附录 A，如表 5）：
    - 在可精确迁移的样本上：可执行复用为 85.9 / 204 tokens，动态生成为 81.7 / 224 tokens，文本 workflow 记忆为 87.3 / 377.5 tokens。
    - 文本记忆的准确率略高，但 token 多 85%。作者据此主张两者处在"准确率–效率前沿"的不同位置。
    - 在完整划分上，四种 router 两两之间都没有显著差异（McNemar p > 0.5，如表 8）。

![[Pasted image 20260923151357.png]]

---

### 五、核心结论

- 把成功的 workflow 编译成可执行 skill，而不是存成文本，能在不训练模型的情况下持续积累能力。
- 收益主要来自两种机制：
    - 直接复用：在任务结构重复的场景中主导收益（ALFWorld）；
    - skill 作为上下文：在每题都不同的场景中起作用（代码和数学）。
- 基于对比效用的生命周期管理，能自动识别并压制负迁移的 skill。
- 这一能力层与模型规模互补：base model 越弱，收益越大。

---

### 六、评价

#### 主要优点

- **问题定位清晰**：把 workflow 优化、文本记忆和工具库三条线的空白讲得很到位。"成功 workflow 介于文本记忆与人工工具之间"这一 framing 很有说服力。
- **设计完整且务实**：skill 同时具备可执行、可验证、可审计的特性；准入、降级、shadow、suppress 构成一个完整的生命周期。对比评估是一个轻量而实用的负迁移检测方法。
- **实验覆盖面广**：包括 5 个 benchmark 的完整划分、8 个 baseline、10 个 backbone，并使用了多 seed 和 McNemar 检验。
- **结果报告相对诚实**：
    - 承认文本记忆在 MBPP 精确迁移场景中准确率略高；
    - 承认 router 之间没有显著差异；
    - 如实报告了 Qwen3-8B 的失败案例；
    - 承认 MBPP 和 MATH 上的 token 成本更高。

#### 潜在问题与局限

- **ALFWorld 的巨大提升高度依赖任务结构。**
    - 6 类任务以参数化模板反复出现，这正是"模板重放"最擅长的场景。
    - 附录中 ALFWorld 的 system prompt（Listing 1）已经硬编码了 6 类任务的动作模式。论文未明确说明 baseline 是否使用了相同的 prompt，这会影响比较的公平性。
- **代码和数学任务上的收益归因不清。**
    - 消融实验只在 ALFWorld 上做，没有在代码和数学上拆分 adaptive escalation（多级 ensemble 和重试）与 skill 机制各自的贡献。
    - 同时 MBPP 上各 router 没有显著差异。因此代码和数学上的提升可能更多来自 escalation，而不是 skill 本身。
    - 此外，escalation 依赖"验证失败"来触发，但论文未明确说明代码任务的验证用的是公开示例测试还是隐藏测试。若是后者，则存在信息泄露风险。
- **Curation 的统计证据偏弱。**
    - suppression 的判定基于极小样本（例如 2/14 对 1/3），不使用该 skill 的 episode 最少只需 3 个，噪声很大。
    - "匹配的未使用 episode"如何选取、是否随机，论文描述有限，称之为"因果信号"偏乐观。
- **跨模型对比只对 ExpeL。** 10 个模型的鲁棒性实验只与 ExpeL 比较，而 ExpeL 在 ALFWorld 上本就很弱，没有与 AFlow 等更强的 baseline 做跨模型对比。
- **系统复杂度高。** 共有 177 个常数和大量启发式阈值。作者称没有针对各 benchmark 单独调参，但这些默认值本身如何确定未见说明，可复现性和迁移性存疑。
- **适用范围受限。**
    - 依赖可验证的反馈信号，开放式对话、长文写作等场景不在覆盖范围内。
    - 每个 benchmark 从空 bank 独立开始，没有验证跨领域迁移。
    - 在更长的任务流中，bank 的膨胀和检索干扰问题尚未检验。