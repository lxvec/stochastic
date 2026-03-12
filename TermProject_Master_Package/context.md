
In this folder, you will see all my notes for my sarcastic calculus class. We have a term project project_complete.PDF we need to answer the questions that are outlined in this document.

Here is the philosophy to follow for your approach:
1. Do not download anything on my computer without requesting me. This goes for installing packages, fetching anything from the Internet. Be conservative and ask me before fetching anything that will stay on my computer. I would actually want you to create a skill or an agent whose role is to block any downloads, installs, fetching from the Internet.

2. All architectural decisions must be run by me. This includes asking me what libraries you intend to use, coding languages, or other technological decision-making.  I also want you to create a markdown file which stores all the architecture decisions that were made. This includes libraries used methods created, and models used. Any code should be very well commented. I should know exactly what the methods are doing, and I want it to be created in a modular way. Do not re-create code that could be fetched from a library. I want you to just ask me to use that library and I will give you permission or not.

3. You are building this from the perspective of an instructor in university. So everything that you're building should be intuitive, easy to understand, as if they were coming from the lecture notes of my professor. For anything that you create, I want an explanation of how to use it and how you created it. Nothing too complicated just a few sentences at least. And if it requires more than a few sentences, please be verbose if required.

4. Always explain assumptions. For example, always explicitly explain which probability measure we are evaluating this under, explain the financial products we are analyzing, etc.

5. On the first iteration of creating this document, I want you to just create a static late PDF file, with verbose, intuitive, correct solutions to these questions. Simulations and code may follow, but for now I want you to create static graph that demonstrate the ideas. I don't want you to focus on image generation too much. Here I would like you to leverage getting photos from the Internet or literature to support your case. And if you can't get it from the Internet, then maybe point me to resources where I can find you a graph. We will do simulations and code later on when I can actively code with you, but for now I just want to see what kind of first document you create. For each of these questions I want you to be creative, that means if there is an opportunity,, to simulate, basically to visualize the mathematical rigger, and the financial concepts that are being presented in the document, I want you to make a note of what your ideas would be, and then we will code it up together at a later time. At the end of every question, I want you to leave open ended questions, and open ended suggestions.

6. Store what you create in one folder. On this first iteration, I just want you to create one or two documents, so that would be the latex document and it's PDF file. Remember, you are an instructor and you are building the answer to this question to teach students at the masters degree level. Do you want to look at the class that I'm providing to you because that gives you an idea of what the students already know.

7. Once you are done this first iteration changes or fixes yourself and then I will review it with you. Prompt me if you have any questions or if anything is unclear while you're building this out.


Now I'm going to outline each question that means answering and how I want you to approach it.
I'm open to suggestion to reduce inefficiencies or redundancies, but just ask me prior to executing.

2 Spot rate, forward rate, Zero-coupon yield curve 

Answer this question in depth. I want to gain an intuitive understanding from your document. First introduced with a zero coupon product is and also it is there a coupon yield curve and also this notation y(t,T) and what it means. Before explaining how it's related to the instantaneous risk free rate the instantaneous forward rate and is there a coupon bond price I want you to first outline which each of these objects are. First make the reader gain an intuitive understanding of what each of these rates and prices are, and mean in the financial space and then start building the relationship between them. Use graphs if necessary. I think this question would be neat to have some interactive graphs with some sliders such that we can see how the rates may affect the price. Remember if this is a stick to calculus class so the response should be probability theoretical and have mathematical reasoning tied to finance. Be open minded in your response, give examples to help with intuition.

3 Short-rate dynamics under P 

First similarly to the above response, I want you to explain what everything is before actually answering the question. You should explain what a standard brownie in motion is and what it means for it to be a brownie in motion under the physical measure P. What is P? Relate this to the class notes on measure theory and probability spaces. The document you create should be a natural extension of the class notes. Explain what the short rate is, Explain how it represents the instantaneous risk free rate and explain what the CIR square root diffusion model is.
Do not gloss over this model we need an in-depth understanding of what it is. We have not learned it in class yet. If you do not want to re-create a little review, add links to good resources to understand what the CIR square root diffusion is. I expect at least half a page on explaining what CIR is, including what the variables mean with intuition, include a graph here with an example if necessary to really drive home the intuition. 
i. What is a strong solution before answering why this model admits a strong solution. Then answer that question.
ii. Do we have constraints on the parameters? If so, explain why we would.
iii. Interpret the constraints on the parameters give examples what happened what happens when we go beyond these constraints.
iv. What is the distribution of RT. Again, explain what RT is in this context, and then answer the question of what it's distribution is. Once you know, the distribution explain this distribution and the reader, the probability density function and community density function, as well as how to intuitively reason about this distribution in the context of financial math.
v. First explain what kind of mathematical properties we would be interested in looking for, explain what a short rate dynamic is. The question here is quite open-ended so I want you to answer it, but I want you to also expand beyond it as if you were a professor teaching students this topic. Explain the mathematical properties and why it's appropriate for modelling the evolution of instantaneous rate, go over the specifications, go over why it's appropriate, and go over what modelling the evolution of the instant instantaneous rate exactly means.


4 Risk-neutral dynamics under Q 
For this answer, I want you to really anchor the response in the class notes where we learned a lot of pure math, in addition to the mathematical instruments required to answer this kind of question in debt, from both the finance and math perspective. Review what the risk neutral measure Q is, review with instantaneous risk rates, and review what the instantaneous rate is under Q. Go over this equation, explain what each variable is, notice how it is very similar to the equation from number three, but it is under a different probability measure. Explain how the filtration and space differs between these measures, explain the impact of this change in probability measure on the expectation and the variance, and any other probabilistic formulas.

i. It is unclear as a reader, what exact link we are trying to build between the parameters. First explain with the parameters due, what they mean, in the context of financial math, and how they may relate to one another. Explain this intuitively with finance but also explain it mathematically. 
ii. First explain what a functional form is, then explain what the functional form of the market price of risk is. Then move forward and explain with the functional form of the market price of wrist that is required to ensure that the process remains of CIR type under Q. Before you actually answer this question, I want you to break down every technical term in the question and explain to me what it means, link these technical terms together, so I have a general understanding of the importance of each of them, and then find a solution to the question.
iii. Explain what the Novikov condition is, then prove that it is satisfied. Talk a little bit about what it means for the Novikov condition not to be satisfied, and give intuition about the Novikov condition, and maybe give some history to what this condition is and the importance of checking it.
iv. First explain what time series of the short rate R is. Now explain why it's not observable under the risk measure. Be rigourous in your explanation and use mathematical reasoning, again look at the class notes and leverage what we have already learned in class, then finalize it with financial intuition. Then move onto the next part of the question which asks why is it common practice to maintain the same structural specification under Q. First explain what's saying structural specification is being analyzed, feel free to repeat things that have already been addressed, and then explain what structural specification under queue is and it's common practice to maintain it. Be rigourous in your solution and explanation.


5 Discounted bond price is a martingale 
Prove what it is asking, and this solution absolutely must leverage the class notes and how the previous framework to show that a stock price under the risk neutral measure is a discounted price process and a Q Martingale. There should be very in line with the liaison between the solution come up with and what I already know.
First approached from a mathematically braver perspective, then explain the finance intuition behind it.

6 Zero-coupon bond price in log-affine form (CIR) 
Explain what the formula presented is, explain what each variable means, it give intuition what it means to look at the exponential of an integral. Logarithmic has an important role in modeling. I want you to revisit some basics on why we use exponential. We see that the expectation is under the risk initial measure, given filtration, review what these mathematical objects are really grill into the reader what these variables mean.
i. Prove that in the CIR model the bond price and meant a lot of fine representation as follows. Before you do, I want you to rigorously explain what each of these variables mean which ones are constant, which ones are probability measures, which ones are variables, which ones are sarcastic processes, etc. Once you prove it, I want a full breakdown of each step and I want to be able to re-create this on my own because your solution was sufficiently rigorous.
i. Explain what a sarcastic differential equation is and why we would want to derive it here. Explain what the specific context of this model is and then solve a question. Again, leverage, the solution should be from a instructors perspective. Review what is there a coupon bond prices and then explain what the solution means in terms of understanding the zero coupon, bond price, and how this relates to evaluating the change and movement of the price.


7 Initial yield curve 

This is a very big question so similarly to what I have requested above, I want you to break down every financial and technical term in this paragraph before you move on to solve it. This includes revisiting what these risk neutral parameters are, explaining why it generally does not allow the model to match exactly the observed term structure of interest rates at times zero, explain why specifically at time zero. Explain what it is saying about how as a consequence, the model may fail to reproduce the initial yield curve, what does it mean to fail to reproduce the initial yield curve. It addresses a common remedy of extending the model. I don't want to take this for face value. I want you to prove to me why it is a common remedy and if you can't do so, in a paragraph or two, point me to the literature where this is explained. Explain why this modification introduces sufficient flexibility to fit the initial you exactly, also explain what it means to preserve the fine structure of the model, then proceed to answer how it preserves the fine structure of the model.

Review this formula that is given and related to the above questions, because it seems similar. Then answer the question. How can we choose data such that we are fully consistent with the observed yield curve at times zero. Explain what it means to be fully consistent, and what it would mean to not be fully consis again be repetitive, explain what the observed yield curve is. 

8 Swap 
i. Explain an interest rate swap is, but again explain it from the context of this course use mathematical rigor.
ii. Show that the time to swap rate is a function of zero coupon, bond prices at time T. Set the stage here, explain what time to swap rate is, explain what is your coupon bond prices at time T, and outline the functions and the variables, and parameters that we need in our formula.

9 Swaption 


