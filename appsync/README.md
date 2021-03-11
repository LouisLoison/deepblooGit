## PIPELINE MUTATION FLOW WHICH HAVE MULTI INSERT OR UPDATE AURORA OPERATIONS

1.**Define Pipeline functions using AWS CDK:**
2.**Define some variables in Before template:**
Every mutation with pipeline functions have BEFORE mapping template, this mapping template dont need any resolver, in our case we use this mapping template to set some variables and creating objects in stash which we will use in PIPELINE.
Here are some variables we set in the template
1. pipelineFunctionsList
In pipelineFunctionsList we save the list of functions we have defined in CDK Stack.
2. Here are some properties we add in stash object.
The stash is a Map that is made available inside each resolver and function mapping template.
1. pipelineFunctionsInfo
2. currentPipelineFunctionIndex
3. currentPipelineFunction
