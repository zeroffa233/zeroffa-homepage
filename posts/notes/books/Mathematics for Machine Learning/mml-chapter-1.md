---
title: "Chapter Ⅰ: Introduction and Motivation"
date: "2026-09-21"
---
**Overview**

- Machine learning (ML) is about designing algorithms that **automatically extract valuable information from data**. The key word is _automatically_: the goal is general-purpose methods, not hand-crafted rules for one dataset.
- The book aims to fill a gap. Most ML textbooks assume math the reader may not have, and most math textbooks never connect to ML. This book gathers the essential math and shows how it supports core ML methods.

**1.1 Finding Words for Intuitions**

The chapter builds everything on three core concepts:

| Concept      | Meaning in this book                                                            | Key points                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Data**     | Assumed to be numerical and represented as **vectors**                          | Real-world data such as text or images must first be converted into numbers. Choosing that representation, sometimes called feature engineering, matters a lot. |
| **Model**    | A description of the process that generates the data                            | A good model captures the relevant aspects of the true process and produces data similar to the real dataset.                                                   |
| **Learning** | Automatically finding patterns and structure by **optimizing model parameters** | The goal is **generalization**: good performance on _unseen_ data, not just on the training data.                                                               |

- **Three views of a vector.** The book deliberately keeps all three in mind:
    - Computer science view: an array of numbers.
    - Physics view: an arrow with a direction and a magnitude.
    - Mathematical view: an object that obeys addition and scaling. This is the most abstract view, and it is the one the book formalizes in Chapter 2.
- **Two meanings of "algorithm."** In ML, "algorithm" can mean either:
    1. a **predictor**, which makes predictions from inputs, or
    2. a **training procedure**, which adapts the predictor's parameters using data.Keeping these apart avoids a lot of confusion later.
- **Caution on terminology.** Words like "model" and "algorithm" are used loosely across the ML literature, so the reader should pay attention to context.

> Takeaway: ML = representing data as vectors + choosing a suitable model + learning parameters that generalize.

**1.2 Two Ways to Read This Book**

- **Bottom-up:** build the foundations first, then move to ML methods. This is rigorous but can feel unmotivated at the start.
- **Top-down:** start from an ML application and drill down to the math it needs. This is motivating, but the foundations may stay shaky.
- The book is modular, so it supports both. **Part I** covers the mathematics and **Part II** covers ML methods. Readers can move back and forth between them.

Structure of the book:

|Part|Chapter|Topic|
|---|---|---|
|I: Mathematical Foundations|2|Linear Algebra|
||3|Analytic Geometry|
||4|Matrix Decompositions|
||5|Vector Calculus|
||6|Probability and Distributions|
||7|Continuous Optimization|
|II: Central ML Problems|8|When Models Meet Data (empirical risk minimization, maximum likelihood / MAP estimation, probabilistic modeling, model selection)|
||9|Linear Regression|
||10|Dimensionality Reduction (PCA)|
||11|Density Estimation (Gaussian Mixture Models)|
||12|Classification (Support Vector Machines)|

- The four chapters in Part II are the **four pillars of ML**. Each one is paired with a classic method:

|Pillar|Task|Method in the book|
|---|---|---|
|Regression|Map inputs to real-valued outputs|Linear regression|
|Dimensionality reduction|Find a compact, lower-dimensional representation|PCA|
|Density estimation|Find a probability distribution that describes the data|GMM|
|Classification|Map inputs to discrete labels|SVM|

- Part I is the "foundation" that supports these pillars. The book's cover illustration is built on this metaphor.

**1.3 Exercises and Feedback**

- Part I mostly has pen-and-paper exercises.
- Part II comes with programming tutorials as Jupyter notebooks, which let readers explore the ML methods hands-on.
- The companion website, mml-book.com, hosts the materials and errata. Readers are invited to send feedback.

**Key Takeaways**

- ML relies on three ideas: **data, model, learning**. Everything else in the book builds on them.
- **Generalization**, not fitting the training data, is the real objective of learning.
- Math is the language for making ML intuitions precise, which is where the section title comes from.
- The book can be read bottom-up or top-down. Part I provides the tools, and Part II applies them to the four pillars.