import { config } from "JS/Config";
import { Amplify } from "aws-amplify";

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.cognitoAuth.userPoolId,
        userPoolClientId: config.cognitoAuth.userPoolWebClientId,
      },
    },
  });
}
