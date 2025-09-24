import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class CdkChallengeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    //SSM Parameter Store to store the string
    const dynamicStringParameter = new ssm.StringParameter(this, 'DynamicStringParameter', {
      parameterName: '/dynamic-string', 
      stringValue: 'Hello World'
    });

    //Lambda function
    const challengeFunction = new lambda.Function(this, "CDKChallengeFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.AssetCode.fromAsset("lambda"),
      environment: {
        DYNAMIC_STRING_PARAMETER_NAME: dynamicStringParameter.parameterName
      }
    });

    //Lambda permissions to access to parameter store
    dynamicStringParameter.grantRead(challengeFunction);


    //Let's define an api with api gateway
    const api = new apigateway.RestApi(this, "CDKChallengeApi", {
      restApiName: "CDKChallengeService"
    });

    //A Resource. Define the route /cdk-challenge
    const challengeResource = api.root.addResource('cdk-challenge');

    //Let's create an integration between lambda and api gateway 
    const challengeIntegration = new apigateway.LambdaIntegration(challengeFunction, {
      proxy: false,
      integrationResponses: [
        {
          statusCode: "200",
          responseTemplates: {
            "text/html": "<h1>$input.path('$')</h1>"
          },
          responseParameters: {
            "method.response.header.Content-Type": "'text/html'"
          }
        }
      ]
    });

    //A GET method for /cdk-challenge
    challengeResource.addMethod('GET', challengeIntegration, {
      methodResponses: [
        { 
          statusCode: "200",
          responseModels: {
            "text/html": apigateway.Model.EMPTY_MODEL
          },
          responseParameters: {
            "method.response.header.Content-Type": true
          }
        }
      ]
    });

    new cdk.CfnOutput(this, 'ChallengeApiUrl', {
      value: api.url
    })
  }
}
