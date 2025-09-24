import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class CdkChallengeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here


    //Lambda function
    const challengeFunction = new lambda.Function(this, "CDKChallengeFunction", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: lambda.AssetCode.fromAsset("lambda")
    });

    //Let's define an api with api gateway
    const api = new apigateway.RestApi(this, "CDKChallengeApi", {
      restApiName: "CDKChallengeService"
    });

    //Resources. Define the route /cdk-challenge/{dynamic}
    const challengeResource = api.root.addResource('cdk-challenge');
    const dynamicResource = challengeResource.addResource('{dynamic}');

    //Let's create an integration between lambda and api gateway 
    const challengeIntegration = new apigateway.LambdaIntegration(challengeFunction, {
      proxy: false,
      requestTemplates: {
        'application/json': `{
          "dynamic": "$input.params('dynamic')"
        }`
      },
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

    //A GET method for cdk-challenge/{dynamic}
    dynamicResource.addMethod('GET', challengeIntegration, {
      requestParameters: {
        'method.request.path.dynamic': true
      },
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
