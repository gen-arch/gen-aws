# drawing
![aaa](https://github.com/Gen-Arch/aws-drawing/blob/master/gen-aws.png)

# install
module install
```
npm install
```

# configure
## copy config file
```
cp cdk.json.sample cdk.json
cp env.sh.sample env.sh
```

## edit config file
Please rewrite the contents of the file to your environment
```
vim cdk.json
vim env.sh
```

# deploy
```
cdk synth -c env=<environment>
cdk diff -c env=<environment>
cdk deploy -c env=<environment>
```
