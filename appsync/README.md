### PIPELINE MUTATION FLOW WHICH HAVE MULTI INSERT OR UPDATE AURORA OPERATIONS

1.**Define Pipeline functions using AWS CDK:**
![image](https://user-images.githubusercontent.com/17459522/110761031-1af34d00-8271-11eb-8b06-e6f4cdb78cb9.png)

2.**Before Mapping template:**
The request mapping template of a pipeline resolver or also called the Before step, allows to perform some preparation logic before executing the defined functions. 
Every mutation with pipeline functions have BEFORE mapping template, this mapping template dont need any resolver, in our case we use this mapping template to set some variables and creating objects in stash which we will use in PIPELINE.

Here are some properties we add in stash object.
The stash is a Map that is made available inside each resolver and function mapping template.
1. pipelineFunctions (List of names of defined Pipeline functions in Stack).
2. pipelineFunctionsInfo (Info of each Pipline function).
3. currentPipelineFunctionIndex (index of executing function, we need this to track which function gets executed. We define the value of index from where we want to trach the Pipeline, in our case we start tracking from Aurora INSERT OR UPDATE operations because we are reusing the same template for these operations.).
4. currentPipelineFunction (String value current pipeline function based on index).

Example data we save in stash.
1. ![image](https://user-images.githubusercontent.com/17459522/110757948-c5697100-826d-11eb-8402-d4e5fd855336.png)
2. ![image](https://user-images.githubusercontent.com/17459522/110758396-4b85b780-826e-11eb-843e-0cb2dd61db96.png)
3. ![image](https://user-images.githubusercontent.com/17459522/110758766-b46d2f80-826e-11eb-9850-f26e56f7426f.png)
4. ![image](https://user-images.githubusercontent.com/17459522/110759092-0f068b80-826f-11eb-8614-a5ff412b4b98.png)

pipelineFunctionsInfo object details
- Currently We have three types of datasources implemented in this project, datasources are
1. Lambda
2. Aurora
3. Local
- Each Pipeline function should be attach with on the datasources we define above. 
- If Pipeline function datasource is Lambda then in pipelineFunctionInfo object we should have this type of object.
![image](https://user-images.githubusercontent.com/17459522/110788782-e3949880-8290-11eb-81ec-5eee5aa35256.png)
- If Pipeline function datasource is Aurora then in pipelineFunctionInfo object we should have this type of object.
- In Pipleline function mapping templates of Aurora datasource we are using UPSERT operation, for which we need a key, and we can define key in object.
![image](https://user-images.githubusercontent.com/17459522/110788999-30786f00-8291-11eb-870f-058472e60da1.png)

2.**PIPELINE FLOW**

