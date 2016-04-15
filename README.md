# mongodb
MongoDB Provisioning 


Used to build MongoDB AMIs for use with Atlas or any other system with some modification

Each script takes a single mandatory `region` input. 
Each script can take an optional second `environment` input which defaults to `prod`.
Each script can take an optional third `cluster_name` input which defaults to `deis-mongodb`.

The Atlas repo relies on the `environment` and `cluster_name` to be at their defaults.


Usage for Deis:

`./build_mongodb_ami.sh us-east-1`
