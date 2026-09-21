---
title: "Foam-Agent: A large language model-based multi-agent framework for automating computational fluid dynamics workflows"
publishedAt: 2026-08-13
acceptedBy: NeurIPS 2026
---

**Abstract:** Computational fluid dynamics (CFD) has been the main workhorse of computational physics, yet its steep learning curve and fragmented, multi-stage workflow create significant barriers to entry. We present Foam-Agent, a multi-agent framework that leverages large language models (LLMs) to automate the end-to-end CFD workflow in OpenFOAM from a single natural-language prompt. Foam-Agent rests on three methodological contributions. First, a multi-index retrieval scheme organizes domain knowledge along four complementary structural dimensions and selects indices by workflow stage, sharpening retrieval precision over conventional single-index retrieval-augmented generation. Second, dependency-aware file generation is formulated as a topological traversal of the OpenFOAM case dependency graph, so that each configuration file is synthesized in the context of its already-generated predecessors, enforcing cross-file consistency. Third, a trajectory-conditioned reviewer loop iteratively repairs failed runs by conditioning each correction on the accumulated error-and-diagnosis trajectory of its own previous attempts, applying at each step a minimal configuration edit that targets a reduced solver-error set. Around these contributions, six specialist agents span planning, meshing, file writing, execution, review, and visualization; Foam-Agent additionally exposes its capabilities through the Model Context Protocol as a deployment surface for external orchestrators. On FoamBench, FoamAgent achieves an 88.2% execution success rate on the 110 Basic-tier tasks and 62.5% on the outof-distribution Advanced tier, 1.6× and 5× those of the prior MetaOpenFOAM framework, both with Claude 3.5 Sonnet, all without expert intervention, and we report a complementary fieldlevel fidelity metric to distinguish crash-free execution from solution accuracy. These results demonstrate how the strategic harnessing of specialized multi-agent systems can reduce expertise barriers while preserving the rigor of solver-based simulation workflows.

# 背景

- **CFD 的地位**：计算物理的主力工具，广泛用于飞行器、风机、血流模拟等，可替代昂贵的物理原型实验
- **使用门槛高**：OpenFOAM 流程多阶段且碎片化
    - 前处理：几何建模与网格生成（blockMesh、snappyHexMesh、Gmsh）
    - 求解配置：数十个相互依赖的字典文件
    - 后处理：流场可视化
    - 需要多年领域经验，学习曲线陡峭
- **技术机遇**：LLM Agent 能理解高层指令、分解任务、调用工具、迭代修正
    - 已有跨领域先例：ChemCrow（化学）、合金设计多智能体（材料）、AutoFEA / MooseAgent（有限元）
- **CFD 领域的先行工作**：MetaOpenFOAM、OpenFOAMGPT，基于 RAG 检索教程案例，将自然语言翻译为 OpenFOAM 配置文件


# 动机

## 已有工作的缺陷

1. **流程覆盖不全**：只处理求解器配置，忽略最耗时的前处理（复杂几何网格）和后处理（可视化）
2. **单体架构**：无法只调用某个环节（如单独调试一个配置文件），难以嵌入更大的科研工作流
3. **可靠性不足**：复杂任务上执行成功率偏低

> **难点根源**：OpenFOAM 案例由大量相互引用的文件组成。system/（求解控制、数值格式）约束 constant/（物性、湍流模型），constant/ 又约束 0/（初始和边界条件）。若逐个独立生成，容易出现字段名不匹配、单位错误、引用未定义变量等问题。同时，自然语言与 OpenFOAM 术语之间存在语义鸿沟，单一检索噪声大。

## 解决思路

| 缺陷     | Foam-Agent 的方案                                                   | 对应实验                         |
| ------ | ---------------------------------------------------------------- | ---------------------------- |
| 流程覆盖不全 | Meshing Agent（三种网格策略）+ Runner（本地/HPC）+ Visualization Agent，实现端到端 | 3.4 外部网格、3.5 Gmsh 网格、3.6 HPC |
| 单体架构   | 基于 MCP 拆分为 11 个原子函数，由 LangGraph 或外部编排器调度                         | 3.7 NACA0012 编排演示            |
| 可靠性不足  | 依赖感知文件生成 + 分层多索引 RAG + Reviewer 迭代纠错                             | 3.2 主结果、3.3 消融               |

# 方法

## 整体流程

![[Pasted image 20260921193135.png]]

主流程按顺序执行：

1. **Architect Agent**：需求 → 文件与目录生成计划
2. **Meshing Agent**：生成或导入网格
3. **Input Writer Agent**：按依赖顺序生成全部配置文件
4. **Runner Agent**：执行仿真，捕获日志
5. 若失败 → **Reviewer Agent** 分析错误、生成修正补丁 → 回到第 4 步（最多 M 轮）
6. 若成功 → **Visualization Agent** 生成流场图

> **Algorithm 1 要点**：每轮失败后，ErrorParser 把日志解析为结构化错误 Eₜ，Reviewer 基于错误、当前配置和历史 H 计算补丁 Δₜ，更新配置 Cₜ = Cₜ₋₁ ⊕ Δₜ，并把 (Cₜ₋₁, Cₜ, Δₜ) 写入历史，防止来回修改同一处。

## 六个 Agent

|Agent|输入 → 输出|关键设计|形式化|
|---|---|---|---|
|Architect|需求 → 有序任务列表|先用 Pydantic 做案例分类（名称、领域、类别、求解器）作为预过滤；再级联检索：先找相似案例的目录结构，再查详细文件配置|Π = {T₁…Tₙ}，Tᵢ = (fᵢ 文件路径, ρᵢ 生成优先级, σᵢ 检索到的模式约束)|
|Meshing|需求/网格文件 → polyMesh|自动三选一：OpenFOAM 原生字典；Gmsh（写 Python 脚本生成 .msh，再用 gmshToFoam 转换）；用户提供的外部网格|—|
|Input Writer|任务 + 网格 → 配置文件|生成顺序 system → constant → 0 → Allrun；将前驱文件内容注入上下文 {图1}|Cᵢ = LLM(Tᵢ, Kᵢ, {Cⱼ}ⱼ∈Pre(i))，即在依赖图 G = (V, E) 上做拓扑遍历|
|Runner|文件 → 日志|支持本地和 HPC（自动写 Slurm 脚本、提交、监控）；用模式匹配从日志提取错误|Φ: L → E = {e₁…eₘ}，每条记录含错误消息、位置、严重度|
|Reviewer|错误 + 文件 + 历史 → 补丁|错误上下文化；轨迹分析防止循环修正；禁止修改用户指定的参数|求在用户约束下消除错误的最小补丁 Δₜ|
|Visualization|仿真结果 → png|从 prompt 解析目标物理量，写 PyVista/ParaView 脚本；报错时自修复，重试上限可配置|—|

## 分层多索引检索

- **知识库来源**：解析 OpenFOAM 官方教程，提取四个维度
    - 案例元数据：名称、流动领域、物理类别、求解器
    - 目录结构：文件与文件夹的层级组织
    - 文件内容：配置语法、参数定义、注释
    - 执行脚本：准备、运行、后处理的命令序列
- **四个独立 FAISS 索引**（text-embedding-3-small，1536 维）
    - Tutorial Structure Index：匹配结构模板
    - Tutorial Details Index：边界条件、数值格式、物理模型
    - Execution Scripts Index：命令序列
    - Command Documentation Index：工具命令用法与参数
- **检索流程（Algorithm 2）**：查询向量化 → 按工作流阶段选择索引 → 取 Top-10 → 过滤（相似度 > τ 且求解器匹配）→ 注入该阶段的 prompt 模板

> **与单索引的区别**：单索引用一个键检索所有内容；分层检索以案例元数据为第一层键，再逐级叠加目录结构、案例名、求解器等信息，逐步收窄范围，降低噪声。

## MCP 模块化

![[Pasted image 20260921193219.png]]

![[Pasted image 20260921193249.png]]

- **三个设计原则**
    - 原子性：每个函数只做一件事
    - 有状态：用 case_id、job_id 追踪多阶段仿真
    - 流程解耦：网格、求解、后处理相互独立
- **编排方式**：LangGraph 状态图，节点是 MCP 函数调用，边是根据执行结果决定走向的条件逻辑
- **可靠性保障**：所有函数 I/O 和图状态都用 Pydantic 强类型 schema 做运行时校验
- **11 个函数**：create_case、plan_simulation_structure、generate_file_content、generate_mesh、generate_hpc_script、run_simulation、check_job_status、get_simulation_logs、review_and_suggest_fix、apply_fix、generate_visualization（其中网格、运行、可视化为异步，返回 job_id）

## 组件之间的关系

|组件|作用环节|解决的问题|
|---|---|---|
|分层 RAG|规划与文件生成|提高初始文件质量（减少检索噪声）|
|依赖感知生成|文件生成|提高初始文件质量（跨文件参数一致）|
|Reviewer|运行之后|兜底纠错，提高最终成功率|
|MCP|整体架构|可组合性，与准确率无关|

> 前两者减少初始错误，从而减少 Reviewer 的循环次数；Reviewer 保证最终成功率；MCP 与三者正交。

# 实验

## 设置

- **基准**：CFDLLMBench，110 个 OpenFOAM 案例，覆盖 11 类物理场景；每个案例以自然语言描述问题、几何、求解器、边界条件和参数
- **指标**：执行成功率（无人工干预下成功运行的比例）
- **基线**：MetaOpenFOAM（OpenFOAMGPT 未开源，未纳入）
- **模型**：Claude 3.5 Sonnet、GPT-4o

## 主结果

![[Pasted image 20260921193333.png]]

|框架|Claude 3.5 Sonnet|GPT-4o|
|---|---|---|
|MetaOpenFOAM|55.5%|17.3%|
|Foam-Agent|**88.2%**（+32.7）|**59.1%**（+41.8）|

与人类专家结果的定性对比：

- **CounterFlowFlame**（CH₄ 质量分数）：Foam-Agent 还原了火焰锋面的陡峭梯度；基线过渡区弥散
- **Wedge**（温度场）：基线连基本几何都没有重建正确
- **ForwardStep**（速度幅值）：Foam-Agent 与真值几乎一致；基线速度整体偏低

## 消融实验

![[Pasted image 20260921193355.png]]

均使用 Claude 3.5 Sonnet，温度分别取 T = 0 和 T = 0.6。

|消融对象|条件|成功率变化|其他指标|
|---|---|---|---|
|Reviewer|无 → 有|约 50% → 80% 以上|贡献最大的组件|
|文件依赖|无 Reviewer|T=0：48.2 → 56.4；T=0.6：45.4 → 57.3|Token 282k → 315k|
|文件依赖|有 Reviewer|86.4 → 88.2|Reviewer 平均循环次数：T=0：0.90 → 0.79；T=0.6：1.87 → 0.96|
|检索策略|无 Reviewer|单索引 44.6 → 分层 57.3|Token 271k → 307k|
|检索策略|有 Reviewer|单索引 84.6 → 分层 88.2|Token 232k → 334k|

> **消融结论**：
> 
> - 无 Reviewer 时，依赖生成和分层 RAG 各自带来约 8~13 个百分点的提升，单独价值清晰
> - 有 Reviewer 时，初始错误大多能被纠正，二者对成功率的影响变小
> - 但文件依赖让 Reviewer 收敛更快（高温下循环次数减半），因此其主要价值在于减少 API 调用和运行时间

## 能力演示

|场景|对应图|设置|结论|
|---|---|---|---|
|外部网格导入|{图5}|多段翼型（2D）、串列翼（3D），输入 .msh；simpleFoam + Spalart-Allmaras，入口速度 9 m/s|速度云图与人类专家结果高度吻合；物性、湍流模型、边界条件、求解器一致，仅数值格式有细微差异|
|Gmsh 网格生成|{图6}|圆柱绕流、双方柱绕流，pisoFoam|OpenFOAM 原生网格工具无法正确表示障碍物，Gmsh 路径成功，说明专用网格 Agent 有必要|
|HPC 运行|{图7}|3D 顶盖驱动方腔，100³ 约百万网格，Perlmutter 集群，32 个子域|将集群文档（分区限制、模块命名、脚本头语法）注入上下文，生成有效 Slurm 脚本，避免幻觉指令|
|MCP 编排|{图8}|以 Cursor 为编排器，NACA 0012 翼型|依次调用 generate_mesh → generate_file_content → generate_hpc_script → run_simulation → generate_visualization，端到端完成|

## 结论与未来工作

- **结论**：分层 RAG、依赖感知生成、执行驱动的纠错和 MCP 模块化相结合，实现 CFD 全流程自动化，成功率 88.2%
- **未来工作**：从“执行正确”走向“结果正确”，引入视觉语言模型解读可视化结果，与预期物理模式比对，形成闭环优化

# 思考

- **指标局限**：执行成功只代表程序跑通，不等于物理正确。物理保真度仅有 3 个案例的定性图像对比，缺少定量误差
- **基线单一**：只对比了 MetaOpenFOAM，缺少“单 Agent + 相同 RAG”之类更强的对照
- **模型偏旧**：换用更强的模型后，Reviewer 和分层 RAG 的相对增益是否仍然显著，有待验证
- **潜在数据重叠**：知识库来自官方教程，若基准任务也源自教程场景，检索可能接近“查答案”，对全新场景的泛化能力需进一步考察
- **成本权衡**：有 Reviewer 时，分层 RAG 使 Token 增加约 44%（232k → 334k），只换来 3.6 个百分点的提升

