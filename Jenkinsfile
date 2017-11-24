node {
    stage 'Build'
    checkout scm
    sh '''
      npm install
      npm run build:qa
      docker build -f docker/Dockerfile -t hit/hit-web:latest .
    '''
    stage 'Docker Push'
    sh '''
      $(aws ecr get-login --region us-east-1)
      GIT_COMMIT=$(git rev-parse HEAD | cut -c 1-7)
      docker tag hit/hit-web:latest 127918707993.dkr.ecr.us-east-1.amazonaws.com/hit/hit-web:$BRANCH_NAME-$GIT_COMMIT-qa
      docker push 127918707993.dkr.ecr.us-east-1.amazonaws.com/hit/hit-web:$BRANCH_NAME-$GIT_COMMIT-qa
    '''

    stage 'Deploy To QA'
    sh '''
        #!/bin/bash -xe

        GIT_COMMIT=$(git rev-parse HEAD | cut -c 1-7)
        /var/lib/jenkins/kubectl --kubeconfig=/var/lib/jenkins/kube-config-hit.qa set image deployment/hit-web-deployment hit-web=127918707993.dkr.ecr.us-east-1.amazonaws.com/hit/hit-web:$BRANCH_NAME-$GIT_COMMIT-qa
    '''

    stage 'Build Prod'
    sh '''
      npm install
      npm run build:prod
      GIT_COMMIT=$(git rev-parse HEAD | cut -c 1-7)
      docker build -f docker/Dockerfile.prod -t hit/hit-web:$BRANCH_NAME-$GIT_COMMIT-prod .
    '''

    stage 'Docker Push Prod Image'
    sh '''
      GIT_COMMIT=$(git rev-parse HEAD | cut -c 1-7)
      docker tag hit/hit-web:$BRANCH_NAME-$GIT_COMMIT-prod 127918707993.dkr.ecr.us-east-1.amazonaws.com/hit/hit-web:$BRANCH_NAME-$GIT_COMMIT-prod
      docker push 127918707993.dkr.ecr.us-east-1.amazonaws.com/hit/hit-web:$BRANCH_NAME-$GIT_COMMIT-prod
    '''
}
