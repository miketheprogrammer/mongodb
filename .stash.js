INSTANCE_ID=`wget -qO- http://instance-data/latest/meta-data/instance-id`
REGION=`wget -qO- http://instance-data/latest/meta-data/placement/availability-zone | sed 's/.$//'`
aws ec2 describe-tags --region $REGION --filter "Name=resource-id,Values=$INSTANCE_ID" --output=text | sed -r 's/TAGS\t(.*)\t.*\t.*\t(.*)/\1="\2"/' > /etc/ec2-tags
sudo sed -i 's/aws:cloudformation:logical-id/aws_cloudformation_logical_id/g' /etc/ec2-tags
source /etc/ec2-tags
curl http://169.254.169.254/latest/meta-data/local-ipv4 | jq -R . > /etc/myip
aws ec2 describe-instances --region=us-east-1 --filter Name=tag:Role,Values=ReplicaInitializer | jq '.Reservations[].Instances[].PrivateIpAddress' | jq -s . > /etc/replicainitializer
aws ec2 describe-instances --region=us-east-1 --filter Name=tag:Role,Values=Replica | jq '.Reservations[].Instances[].PrivateIpAddress' | jq -s . > /etc/replicas
aws ec2 describe-instances --region=us-east-1 --filter Name=tag:Role,Values=Arbiter | jq '.Reservations[].Instances[].PrivateIpAddress' | jq -s . > /etc/arbiters
aws ec2 describe-instances --region=us-east-1 --filter Name=tag:StackName,Values=$StackName | jq '.Reservations[].Instances[].PrivateIpAddress' | jq -s . > /etc/stack_instances
aws ec2 describe-instances --region=us-east-1 --filter Name=tag:aws:cloudformation:logical-id,Values=$aws_cloudformation_logical_id | jq '.Reservations[].Instances[].PrivateIpAddress' | jq -s . > /etc/mygroup
sed '/REPLICAINITIALIZER/{
	    s/REPLICAINITIALIZER//g
		        r /etc/replicainitializer
}' /etc/repset_init_tmpl.js > /etc/repset_init.js

sed -i "" -e '/REPLICAS/{
	    s/REPLICAS//g
		        r /etc/replicas
}' /etc/repset_init.js

sed -i "" -e '/ARBITERS/{
	    s/ARBITERS//g
		        r /etc/arbiters
}' /etc/repset_init.js
sed -i "" -e '/STACK_INSTANCES/{
	    s/STACK_INSTANCES//g
		        r /etc/stack_instances
}' /etc/repset_init.js
sed -i "" -e '/MYIP/{
	    s/MYIP//g
		        r /etc/myip
}' /etc/repset_init.js
sed -i "" -e '/MYGROUP/{
	    s/MYGROUP//g
		        r /etc/mygroup
}' /etc/repset_init.js
IPS=`aws ec2 describe-instances --region=us-east-1 --filter Name=tag:StackName,Values=$StackName | jq '.Reservations[].Instances[].PrivateIpAddress' | jq -r .`
while read -r line; do
    echo "... $line ..."
    [ $line != null ] && mongo $line:27017 /etc/repset_init.js
done <<< "$IPS"
mongo /etc/repset_block.js