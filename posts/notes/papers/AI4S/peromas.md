---
title: "PeroMAS: A Multi-agent System of Perovskite Material Discovery"
publishedAt: 2026
acceptedBy: KDD 2026
---
**Abstract:** These models fail to propagate physical constraints across the workflow, hindering end-to-end optimization. In this paper, we propose a multi-agent system for perovskite material discovery, named PeroMAS. We first encapsulated a series of perovskite-specific tools into Model Context Protocols (MCPs). By planning and invoking these tools, PeroMAS can design perovskite materials under multi-objective constraints, covering the entire process from literature retrieval and data extraction to property prediction and mechanism analysis. Furthermore, we construct an evaluation benchmark by perovskite human experts to assess this multi-agent system.

### 一、背景与任务设定

- **领域背景**
    - 晶硅电池 PCE 已接近 26%，但受 Shockley-Queisser 极限约束（单结理论上限约 33%），继续提升的边际收益递减。
    - 钙钛矿太阳能电池（PSC）十年内 PCE 从 3.8% 提升到 26% 以上，叠层结构超过 33%，而且易于制造。
    - 大规模应用仍受三类问题制约：长期稳定性差、含铅毒性、规模化制造的可重复性差。这些问题需要在组分、晶格结构、工艺参数上同时优化。
- **任务 Setting：钙钛矿材料发现是一个多步科学工作流**，包括四个核心环节：
    - 知识准备：文献检索，提取 A/B/X 位占据、前驱体浓度、旋涂转速、退火温度等参数，以及 PCE、Voc、Jsc、FF 等性能指标，形成结构化数据库。
    - 设计：基于知识生成假设，进行组分、结构、工艺设计。
    - 干实验：用 DFT 或 ML 预测带隙、形成能、光电性能，完成可行性筛选。
    - 湿实验：合成、制膜、器件组装和性能测试。
- **研究目的**：构建第一个覆盖“知识准备 → 设计 → 干实验模拟 → 分析反馈”全流程的钙钛矿领域多智能体系统。系统要在多目标约束下（效率、稳定性、毒性）闭环迭代出候选配方，并用湿实验验证。

---

### 二、研究动机：已有方案的缺陷

![[Pasted image 20260923152942.png]]

作者把现有 AI 钙钛矿研究归为三种范式（如图 1），并按任务环节梳理了相关工作的覆盖范围（如图 2）：

|范式|代表工作|能做什么|主要缺陷|
|---|---|---|---|
|机器学习（RF / SVM / GNN）|GNoME 等|结构/工艺 → 性能的高精度映射，快速预测 PCE、稳定性、带隙|只自动化单个任务，预测结果无法直接反馈给下游组分设计；多为单目标（通常只最大化 PCE）|
|大语言模型|Perovskite-LLM、Perovskite-R1|通过预训练/微调内化领域知识，辅助检索、综述、实验设计|专业子任务上表现不稳定；知识内化在参数中，无法调用稳定的外部专业工具；约束不可控|
|多智能体|Lee et al.（双钙钛矿）|具备规划、工具调用、反思能力|只覆盖组分设计这一个环节，尚无覆盖全流程的钙钛矿专用 Agent 系统|

![[Pasted image 20260923153025.png]]

- **核心问题总结**
    - 工作流碎片化：各环节模型相互孤立，物理约束无法在 设计–模拟–分析 各阶段之间传递，因此无法端到端优化。
    - 缺少闭环：生成式方法缺乏对候选方案的追踪、诊断和迭代修正。
    - 单目标偏置：只优化 PCE 可能牺牲稳定性，而实际需求是效率、稳定性、毒性的多目标权衡。
- **为什么值得解决**：钙钛矿发现具有高维参数耦合和多目标冲突两大难点，传统试错成本高。一个能统一调度专业工具、闭环迭代的系统，有望显著提升发现效率，并为接入自驱动实验室打基础。



---

### 三、方法

#### 3.1 总体思路与架构（如图 3）

![[Pasted image 20260923153043.png]]

- **问题形式化**：把材料发现建模为动态的多目标优化问题。
- **层次化架构**：
    - 1 个 **Meta Agent**：负责全局规划、约束实例化和决策。
    - 4 个**功能 Agent**：Miner、Designer、Emulator、Analyst，分别对应知识、设计、预测、分析四个阶段。
    - 功能 Agent 通过 **MCP（Model Context Protocol）** 统一接入领域工具，各 Agent 之间通过**共享记忆**传递上下文。

#### 3.2 Meta Agent：以 PDCA 循环驱动的中央规划器

- **输入状态**：第 t 轮的状态为 S_t = {G, M, R_{t-1}}，三个组成部分如下。
    - G = ⟨O_obj, C_const⟩：用户目标。O_obj 是可度量目标（PCE、T80、毒性、稳定性），C_const 是可计算的物理约束（电荷平衡、化学计量、ABX₃ 合法性、容忍因子）。
    - M：历史记忆，保存决策轨迹和执行日志。
    - R_{t-1}：上一轮 Analyst 给出的诊断反馈。
- **三阶段 CoT 推理**：
    1. 目标对齐：判断反馈是否满足终止条件（目标达成或达到迭代上限）。
    2. 反思归因：分析历史记忆，找到失败的根因，避开已被证明无效的路径。
    3. 策略制定：把抽象约束实例化为具体的科学假设 H_t，并为四个 Agent 各生成一条指令，组成指令集 P_t。
- **自适应剪枝**：如果记忆中已有有效数据，就把对应子任务的指令置为 ∅（SKIP），把算力集中到未探索的设计空间。

> 批注：Meta Agent 本身不调用外部工具，是一个纯 LLM 推理的规划器。它的新意主要在于把科研中的 PDCA 循环和“记忆 + 诊断反馈”结构化成状态向量。

#### 3.3 四个功能 Agent

|Agent|要解决的问题|机制|主要工具|输出|
|---|---|---|---|---|
|**Miner**|高维搜索空间的冷启动|“检索–抽取”两阶段：由目标和指令生成查询集 → 检索文献 → 抽取函数 f_ext 把文本解析为 ⟨设计参数, 性能指标, 机理洞见⟩|arxiv-mcp、Sci-mcp、extract-mcp（LLM + SciBERT）|知识库 D_obs，并入记忆 M|
|**Designer**|组分–结构–工艺 (c, s, p) 的高维耦合|“联合生成–约束过滤”：生成模型从隐空间采样 c 和 s；面向合成的 LLM 补全工艺参数 p，同时充当判别器，按硬约束 g(x) 过滤不可行方案|MatterGen、CSLLM、Materials Project API|通过约束校验的候选集 X_new|
|**Emulator**|昂贵的黑盒目标 F(x)|并行调用 GNN（本征性质）和 ML 回归（器件级指标），预测 PCE、T80、稳定性、毒性；用预测标准差估计不确定性；按加权满足度 U(x) = Σ w_i·s_i(x) 排序|CGCNN、Pero-ML（XGBoost / RF / NN）|评估后的候选集 X_eval|
|**Analyst**|闭环中的 “Check” 环节|“规则过滤–归因”两层：先用 Pymatgen、ASE、RDKit 做化学计量和晶体结构合法性检查；再用 SHAP 量化特征贡献，定位限制因素|SHAP-mcp、Pymatgen、ASE|诊断报告 R（硬约束标记、各目标差距、根因、下一轮建议），反馈给 Meta Agent|

- **关键设计选择**
    - 用 MCP 标准化接入异构工具（生成模型、GNN、传统 ML、化学工具包），而不是把知识塞进 LLM 参数。这是作者针对 “LLM 范式缺乏工具调用” 给出的核心回应。
    - Analyst 的诊断报告直接构成下一轮的 R_{t-1}，由此形成真正的闭环，而不是一次性的流水线。
- **论文未明确说明的部分**：不确定性 σ_i 具体如何得到（例如是否使用集成模型）；权重 w_i 如何设定；迭代上限的具体取值。

#### 3.4 工具链的数据来源（附录 A）

- 数据来自开放的 Perovskite Database（43,398 条器件记录，410 个属性）。
- 经过组分过滤、关键属性清洗、去重，再用 Materials Project 补充晶体结构和 DFT 性质（匹配率 75.2%），得到多个任务子集：合成可行性、合成路线、晶体结构生成、性质预测。
- 注意：用于多目标性质回归的数据集只有约 711 条。

#### 3.5 湿实验流程（附录 B）

- 采用经典的 p-i-n 反式结构：ITO / NiOx / 钙钛矿 / C60 / BCP / Ag。
- 钙钛矿层在氮气手套箱中一步法旋涂，并用氯苯作反溶剂。
- 前驱体的化学计量和退火时间按 Agent 给出的配方执行。
- 器件有效面积为 0.09 cm²。

---

### 四、实验

![[Pasted image 20260923153144.png]]

#### 4.1 实验设置

| 项目                     | 内容                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 基准 PeroMAS-Bench（如图 4） | 共 150 个实例，由专家标注。其中原子级任务 130 个（Miner 40 个，其余分给 Designer、Emulator、Analyst），系统级多目标闭环任务 20 个。并设定五个认知维度：工具整合、物理约束、领域特异性、多模态复杂度、推理链 |
| Backbone               | GPT-4o、Claude-4.5、Gemini-2.5、DeepSeek-V3、Qwen3；同组实验中所有 Agent 使用同一个 backbone                                                   |
| 温度设置                   | Miner / Analyst 为 0.1（强调确定性）；Designer 为 0.7（鼓励探索）；Meta 为 0.3                                                                  |
| Baseline               | Standard LLM（GPT-4o，不用工具）；Single ReAct Agent（GPT-Agent，工具相同但只有单一 ReAct 循环）；通用自主 Agent（Manus）                                  |
| 单 Agent 指标             | Tool-Any-Order（选对工具集合）；Tool-In-Order（调用顺序也正确）；Validity 0–10（LLM 评分与专家盲评的平均）                                                   |
| 系统级指标                  | Task Completion（通过硬约束并向软目标迭代收敛的比例）；Output Validity                                                                            |
| 自动评测器                  | GPT-5.2，温度 0.1，双盲                                                                                                             |
| 硬件                     | 计算硬件论文未明确说明；湿实验使用手套箱、旋涂仪、热蒸镀和 AM 1.5G 太阳光模拟器（如图 5）                                                                            |
![[Pasted image 20260923153218.png]]
#### 4.2 主要结果与 Insight

![[Pasted image 20260923153401.png]]

![[Pasted image 20260923153346.png]]

![[Pasted image 20260923153235.png]]

- **原子级能力（Table 1）**
    - DeepSeek-V3 的平均工具准确率最高（89.5%），说明开源模型在“执行型”任务上已能与闭源模型持平。
    - 输出质量方面，各模型优势分散：Claude-4.5 在 Designer（配方设计）的 Validity 最高，GPT-4o 平均 Validity 最高（7.13）。
    - Insight：**工具调用能力与科学推理质量是两种不同的能力**，不同 backbone 各有所长。
- **系统级闭环（Table 2）**
    - Claude-4.5 的完成率最高（72.4%），专家评分也最高（7.14）。
    - DeepSeek-V3 的完成率（61.8%）超过 GPT-5.2（59.0%）。
    - Insight：顶级闭源模型在推理质量上仍然领先；但在编排良好的框架下，开源模型可以弥补执行层面的差距。
- **评测一致性（如图 6a）**：LLM Judge 与专家评分的平均偏差约为 ±0.15，作者据此认为自动评测可信。
- **Baseline 对比（如图 6b）**，得到三点架构层面的结论：


|对比|结果|结论|
|---|---|---|
|GPT-4o 零样本 vs 带工具的方法|GPT-4o 最低（5.90）|仅靠参数化知识不够，外部工具是前提|
|Manus（6.40）vs GPT-Agent（6.48）|通用 Agent 略弱|领域工具比通用自主性更有价值|
|PeroMAS（Claude 7.14，DeepSeek 6.59）vs GPT-Agent|相比单 Agent 提升约 10.2%|层次化分解能降低认知负担；框架设计的作用可以超过模型规模|

- **湿实验验证（如图 5b）**
    - 选取 Top-1 配方：窄带隙 Sn–Pb 混合钙钛矿 (FASnI₃)₀.₆(MAPbI₃)₀.₄，添加 10% SnF₂（还原剂）和 3% EDAI₂（钝化剂），目标带隙约 1.23 eV，含铅量比纯铅体系减少约 50%。
    - 实测 PCE 为 17%，落在系统预测区间 16%–19% 之内，说明干实验预测与物理实验结果一致。