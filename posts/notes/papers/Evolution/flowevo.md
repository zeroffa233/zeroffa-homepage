---
title: "FlowEvo: Self-Evolving Agents through the Co-Evolution of Workflows and Executable Skills"
publishedAt: 2026-07
---

**Abstract:** Large language model agents can adapt to complex tasks by constructing workflows at inference time, but procedures discovered in one episode are usually discarded after execution. Existing skill libraries provide reusable executable routines, but are typically assembled offline and do not grow from the agent's own workflows. We introduce FlowEvo, a training-free framework in which workflows and skills co-evolve at inference time. FlowEvo compiles successful workflows into callable skills, stores them in a persistent bank, and uses retrieved skills either through direct execution or as context for constructing new workflows. It also tracks each skill's downstream utility and suppresses skills that cause negative transfer.
