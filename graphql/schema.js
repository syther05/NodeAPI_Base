const typeDefs = `#graphql
  type Result { Result: Boolean }
 
  type User {
    firstName: String,
    lastName: String,
    userEmail: String,
    userType: String,
    UserGroups: [UserGroup],
  }


  type Query {
    # Users: [User]
  }

  type Mutation {
    # createTree(input: TreeInput): Tree
    # createDispatchPlan(input: DispatchPlanInput): DispatchPlan
  }

  ## Reserved for Subscription ##
  type Subscription {
    # hello: String
  }
`;






export default typeDefs;
