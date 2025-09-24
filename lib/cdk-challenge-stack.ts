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

    const challengeResource = api.root.addResource('cdk-challenge');

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
            "text/html": "$input.path('$.body')"
          },
          responseParameters: {
            "method.response.header.Content-Type": "'text/html'"
          }
        }
      ]
    });

    challengeResource.addMethod('GET', challengeIntegration, {
      requestParameters: {
        'method.request.querystring.dynamic': true
      },
      methodResponses: [
        { 
          statusCode: "200",
          responseModels: {
            "application/json": apigateway.Model.EMPTY_MODEL
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
