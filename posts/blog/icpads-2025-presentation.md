---
title: "ICPADS 2025 讲稿：From Docking Station to Docking Station"
publishedAt: 2025-12-14
---

#### **Slide 1: Title Page**

**(Smile and look at the audience)** 

"Good afternoon, everyone. I am Baixin Wan from Southeast University. 

Today, I will present our paper: **'From Docking Station to Docking Station: Completing Tasks in Minimum Time by Cooperative UAV Fleets.'**"

#### **Slide 2: Outline**

Here is the outline for today's presentation. 

I will start with the background and system model, then explain our core solution and finally show the simulation results.

#### **Slide 3: Outline (Transition)**

**(Skip quickly, or just say)** "Let's move to the Introduction."

#### **Slide 4: Problem Background**

As we know, the low-altitude economy is growing fast.

We focus on **Cooperative UAV Fleets** used for tasks like inspection and logistics.

**(Point to the text 'Fixed endurance')**

Because of battery limits, UAVs always fly along a **predefined route** between automated docking stations, performing collaborative tasks along the way.

#### **Slide 5: System Model Diagram**

"This figure shows our scenario. **(Point to the red flight route)**

The fleet flies from a source station to a destination station. Along this route, there are multiple tasks. Each task requires several UAVs to work together."

"Scheduling this is challenging for three reasons. First, there is **Temporal Dependencies**. 

#### **Slide 7: Challenge 2 - Synchronization**

"Second, is **Synchronization Complexity**. **(Point to the UAVs in the image)** 
#### **Slide 8: Challenge 3 - Search Space**

"Third, the search space is huge because possibilities are infinite. 

So, a key question is: **How to find out the optimal schedule efficiently?**"

#### **Slide 9: Contributions**

"Our contributions are threefold:

1. We formulated this specific problem SR-MUCSP.
    
2. We proposed a novel **'Skyline' geometric representation** to visualize resource availability.
    
3. Based on this, we developed an exact algorithm, several efficient heuristics and make rigorous simulation experiments."

---
#### **Slide 10: Outline (Transition)**

"Now, let's look at the System Model."

#### **Slide 11: Problem Formulation**

"We define the problem formally. Input is a set of homogeneous UAV and a sequence of tasks. **(Point to 'Output')** 

Our goal is to find a schedule that **minimizes the total completion time**, while satisfying two constraints:

1. **Ordering:** Tasks are done in order.
    
2. **Atomicity:** All UAVs assigned to a task must start and finish at the same time."
    

#### **Slide 12: Visualization - The 2D Strip**

"To make this intuitive, we visualize the problem in a **2D strip**. **(Point to the Y-axis)** The y axis represents the **UAV resources**. **(Point to the X-axis)** The x axis represents **Time**. Now, our goal becomes placing tasks into this strip to minimize the total length."

#### **Slide 13: Composite Rectangles**

"In this visualization, each task is a **'Composite Rectangle'**. 

Its width is the duration, and its total height is the number of required UAVs. **(Point to the gap in task t3​)** 

Importantly, because our UAVs are homogeneous (identical), the rows occupied by a task **do not** need to be contiguous. 

So after a placement step, we sort all rows on the strip according to the last available time, forming an M-dimensional available time vector, and we call this skyline.

#### **Slide 14: Review Constraints**

"Here, the physical constraints become geometric rules:

1. **No Overlap:** A UAV can't do two tasks at once.
    
2. **Sequential Placement:** Tasks must be conducted sequentially."
---
#### **Slide 15: Outline (Transition)**

"Next, I will introduce our Solution: The Skyline Framework."

#### **Slide 16: Transition Graph**

"We model the scheduling process as a **State Transition Graph**. It has layered structure.  We define a state by its **Skyline**—which represents the resource availability."

#### **Slide 17: The Crisis**

"However, because we can place a task at infinite positions. A node has **infinite branches**, making the tree impossible to search. So, we need **Pruning Strategies**."

#### **Slide 18: Pruning 1 - Skyline Dominance**

"The first strategy is **Skyline Dominance**. **(Point to the green line S(ΣA​))**

In this figure, If Skyline A is 'lower' and 'left' of Skyline B, it means State A has **more available time** resources. 

So, State A dominates B, and we can safely **prune or say discard** State B."

#### **Slide 19: Pruning 2 - Candidate Placement Points (CPPs)**

"Our second strategy is  **Candidate Placement Points**. We proved that an optimal schedule always aligns tasks to the 'corners' of the skyline. This reduces the branches from infinite to just M."

#### **Slide 20: Exact Algorithm (S-EDP)**

"Combining these strategies, we propose **S-EDP** (Skyline-Based Exact Dynamic Programming). It builds the whole graph using strategies and searches in last layer to find the **global optimum**. However, it is computationally expensive for large scales."

#### **Slide 21: Heuristics (S-SDP & S-G)**

"So, for large-scale problems, we need faster heuristics. We propose **S-SDP**, which divides tasks into segments and only keeps the best state at the boundaries. We also have a **Greedy** version (**S-G**) that just picks the earliest position."

#### **Slide 22: Advanced Heuristic (S-HDP)**

"To improve quality, we designed our best heuristic: **S-HDP** (Heuristic DP). **(Point to the triangle/trapezoid shape)** It uses a **Lookahead Window**. It peeks into future tasks before transitioning. It selects the best state based on a **Scoring Function**."

#### **Slide 23: Scoring Function**

"In the scoring function, we consider three metrics: Time increase, Profile flatness, and **Waste Rate**. **(Point to the heatmaps)** 

Our simulations show that in three scenarios, minimizing the **Waste Rate**, which means the empty space in the schedule is the most critical factor for high-quality solutions. But we cannot only consider it."

---
#### **Slide 24: Outline (Transition)**

"Now, let's look at the Simulation Results."

#### **Slide 25: Small Scale Results**

"In small-scale scenarios, we compared our heuristics against the optimal S-EDP. **(Point to the purple line S-HDP)** You can see that **S-HDP** performs almost perfectly, with less than **1% deviation** from the optimal solution."

#### **Slide 26: Large Scale Results**

"In large-scale scenarios (up to 200 tasks), S-EDP is too slow, so we compare against baselines like Round-Robin and Best-Fit. **(Point to the graph)** Our **S-HDP** (purple line) consistently achieves the lowest completion time. For example, in time-dominant scenarios, it reduces the mission time by up to **10%**."

---
#### **Slide 27: Outline (Transition)**

"Finally, the Conclusion."

#### **Slide 28: Conclusion**

"To summarize:

1. We defined the **SR-MUCSP** problem.
    
2. We proposed the **Skyline Framework** and developed **S-EDP and other heuristics**, which achieves near-optimal performance with short runtimes. 
3. For future work, we plan to extend this to **heterogeneous** UAV fleets."

#### **Slide 29: Thank You**

"Thank you for listening. I am happy to take any questions."
