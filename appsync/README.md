### PIPELINE MUTATION FLOW WHICH HAVE MULTI INSERT OR UPDATE AURORA OPERATIONS

1.**Define Pipeline functions using AWS CDK:**

![image](https://user-images.githubusercontent.com/17459522/110761031-1af34d00-8271-11eb-8b06-e6f4cdb78cb9.png).

2.**Before Mapping template:**
The request mapping template of a Pipeline resolver or also called the Before step, allows to perform some preparation logic before executing the defined functions. 
Every mutation with Pipeline Functions have Before mapping template, this mapping template dont need any resolver, in our case we use this mapping template to set some variables and creating objects in stash which we will use in Pipeline.

Here are some properties we add in stash object.
The stash is a Map that is made available inside each resolver and function mapping template.
- pipelineFunctions (List of names of defined Pipeline Functions in Stack).
- pipelineFunctionsInfo (Info of each Pipline function).
- currentPipelineFunctionIndex (index of executing function, we need this to track which function gets executed. We define the value of index from where we want to trach the Pipeline, in our case we start tracking from Aurora Functions because we are reusing the same template for these operations, In CreateTender example we are starting from index 3)
- currentPipelineFunction (String value current Pipeline Function based on index).

**Example data we save in stash.**
- ![image](https://user-images.githubusercontent.com/17459522/110757948-c5697100-826d-11eb-8402-d4e5fd855336.png).
- ![image](https://user-images.githubusercontent.com/17459522/110758396-4b85b780-826e-11eb-843e-0cb2dd61db96.png).
- ![image](https://user-images.githubusercontent.com/17459522/110758766-b46d2f80-826e-11eb-9850-f26e56f7426f.png).
- ![image](https://user-images.githubusercontent.com/17459522/110759092-0f068b80-826f-11eb-8614-a5ff412b4b98.png).

**pipelineFunctionsInfo object details**
- Currently We have three types of datasources implemented in this project, datasources are
1. Lambda
2. Aurora
3. Local
- Each Pipeline Function should be attach with on the datasources we define above. 
- If Pipeline Function datasource is Lambda then in pipelineFunctionInfo object we should have this type of object.
![image](https://user-images.githubusercontent.com/17459522/110788782-e3949880-8290-11eb-81ec-5eee5aa35256.png)
- If Pipeline Function datasource is Aurora then in pipelineFunctionInfo object we should have this type of object.
- In Pipleline function mapping templates of Aurora datasource we are using UPSERT operation, for which we need a key, and we can define key in object.
![image](https://user-images.githubusercontent.com/17459522/110788999-30786f00-8291-11eb-870f-058472e60da1.png)

3.**MAPPING TEMPLATES FROM INSERT OR UPDATE AURORA PIPELINE FUNCTIONS**
- We have defined mapping template which handles insert and update operations, we reuse that mapping template for every insert or update operatin for Aurora datasource.
- [Request mapping template](https://github.com/deepbloo-team/platform/blob/develop/appsync/function.multiInsertUpdateAurora.request.vtl) 
- [Respone mapping template](https://github.com/deepbloo-team/platform/blob/develop/appsync/function.multiInsertUpdateAurora.response.vtl)

4.**PIPELINE FLOW:**

![image](https://user-images.githubusercontent.com/17459522/111109056-cfe07f00-857b-11eb-87ad-3a27406e754f.png).

Explanation of CreateTender Mutation Pipeline Flow.

- From **CreateTenderAuroraFunction** which index is 3, we all have Aurora Pipeline Function. As definded in point#3 we have one mapping template for insert and update operations, so in order to reuse that mapping template for same Aurora datasource but for different tables we have to pass different data for each table.
- We excessively use two objects in the current Pipeline flow which Pipeline Functions have access to, 
1. $context.stash 
2. $context.prev.result (This is the respone from previous Pipeline Functions), so before Aurora Pipeline Functions we have to pass result from Previous Pipeline Function in correct format, Previous Pipeline Function can be of any datasource.
- In the **CreateTender** Pipeline Mutation from **CreateTenderElasticFunction** we all have Aurora Pipline Functions, so from **CreateTenderElasticFunction** response we return the object in this format.
![image](https://user-images.githubusercontent.com/17459522/111109818-47fb7480-857d-11eb-88bd-e6b9ce3fb40a.png).  
- We can also have a Pipeline Function with Local datasource which can create and return the same object for Aurora Pipeline Functions.
- [This](https://github.com/deepbloo-team/platform/blob/develop/appsync/function.multiInsertUpdateAurora.request.vtl) mapping template have information of which function is executing, so its just use the **$context.stash.currentPipelineFunction** as key to get the details from $ctx.prev.result, please check this(https://github.com/deepbloo-team/platform/blob/develop/appsync/function.multiInsertUpdateAurora.request.vtl) mapping tmplate.

TLDR:
* In Mutation if we want to use reuse template for different Pipline Functions of Aurora datasource for INSERT or UPDATE operation then before using that template we have to define these in correct format
1) BEFORE MAPPING TEMPLATE (check its details in Point#2)
2) Response from Last Pipeline Function(Pipeline Function before Aurora Pipline Functions), in CreateTender example it's a  **CreateTenderElasticFunction**.
    




