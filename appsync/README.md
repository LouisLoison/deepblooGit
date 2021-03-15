### PIPELINE MUTATION FLOW WHICH HAVE MULTI INSERT OR UPDATE AURORA OPERATIONS

1.**Define Pipeline functions using AWS CDK:**
![image](https://user-images.githubusercontent.com/17459522/110761031-1af34d00-8271-11eb-8b06-e6f4cdb78cb9.png)

2.**Before Mapping template:**
The request mapping template of a pipeline resolver or also called the Before step, allows to perform some preparation logic before executing the defined functions. 
Every mutation with pipeline functions have BEFORE mapping template, this mapping template dont need any resolver, in our case we use this mapping template to set some variables and creating objects in stash which we will use in PIPELINE.

Here are some properties we add in stash object.
The stash is a Map that is made available inside each resolver and function mapping template.
a. pipelineFunctions (List of names of defined Pipeline functions in Stack).
b. pipelineFunctionsInfo (Info of each Pipline function).
c. currentPipelineFunctionIndex (index of executing function, we need this to track which function gets executed. We define the value of index from where we want to trach the Pipeline, in our case we start tracking from Aurora functions because we are reusing the same template for these operations, In CreateTender example we are starting from index 3)
d. currentPipelineFunction (String value current pipeline function based on index).

Example data we save in stash.
a. ![image](https://user-images.githubusercontent.com/17459522/110757948-c5697100-826d-11eb-8402-d4e5fd855336.png)
b. ![image](https://user-images.githubusercontent.com/17459522/110758396-4b85b780-826e-11eb-843e-0cb2dd61db96.png)
c. ![image](https://user-images.githubusercontent.com/17459522/110758766-b46d2f80-826e-11eb-9850-f26e56f7426f.png)
d. ![image](https://user-images.githubusercontent.com/17459522/110759092-0f068b80-826f-11eb-8614-a5ff412b4b98.png)

pipelineFunctionsInfo object details
- Currently We have three types of datasources implemented in this project, datasources are
a. Lambda
b. Aurora
c. Local
- Each Pipeline function should be attach with on the datasources we define above. 
- If Pipeline function datasource is Lambda then in pipelineFunctionInfo object we should have this type of object.
![image](https://user-images.githubusercontent.com/17459522/110788782-e3949880-8290-11eb-81ec-5eee5aa35256.png)
- If Pipeline function datasource is Aurora then in pipelineFunctionInfo object we should have this type of object.
- In Pipleline function mapping templates of Aurora datasource we are using UPSERT operation, for which we need a key, and we can define key in object.
![image](https://user-images.githubusercontent.com/17459522/110788999-30786f00-8291-11eb-870f-058472e60da1.png)

3.**MAPPING TEMPLATES FROM INSERT OR UPDATE AURORA PIPELINE FUNCTIONS**
- We have defined mapping template which handles insert and update operations, we reuse that mapping template for every insert or update operatin for AURORA datasource.
- Request mapping template
- Respone mapping template

4.**PIPELINE FLOW:**

![image](https://user-images.githubusercontent.com/17459522/111109056-cfe07f00-857b-11eb-87ad-3a27406e754f.png).

Explanation of CreateTender Mutation Pipeline Flow.

- From CreateTenderAuroraFunction which index is 3, we all have AURORA PIPELINE FUNCTIONS. As definded in point#3 we have one mapping template for insert and update operations, so in order to reuse that mapping template for same AURORA datasource but for different tables we have to pass different data for each table.
- We excessively use two objects in the current Pipeline flow which pipeline functions have access to, 
1. $context.stash object
2. $context.prev.result object (This is the respone from previous pipeline functions), so before Aurora Pipeline Functions we have to pass result from Previous Pipeline Function in correct format, Previous Pipeline Function can be of any datasource.
- In the CreateTender Pipeline Mutation from CreateTenderElasticFunction we all have Aurora Pipline Functions, so from CreateTenderElasticFunction response we return the object in this format 
- We can also have a Pipeline function with Local datasource which can create and return the same object for Aurora Pipeline Functions.
- This (function.multiInsertUpdateAurora.request.vtl) mapping template have information of which function is executing, so its just use the $context.stash.currentPipelineFunction as key to get the details from $ctx.prev.result in this form $context.prev.result[$currentPipelineFunction].

TLDR:
* In Mutation if we want to use reuse template for different pipline Functions of Aurora datasource for INSERT or UPDATE operation then before using that template we have to define these in correct format
1) BEFORE MAPPING TEMPLATE (check its details in Point#2)
2) Response from Last Pipeline function(pipeline function before Aurora functions), in CreateTender example it's a  CreateTenderElasticFunction.
    




