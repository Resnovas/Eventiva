import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { Prisma } from "@prisma/client";
import { DecimalJSScalar } from "../scalars";
import { FeatureOfAddress } from "../models/FeatureOfAddress";
import { FeatureOfRoom } from "../models/FeatureOfRoom";
import { FeatureType } from "../enums/FeatureType";
import { FeatureCount } from "../resolvers/outputs/FeatureCount";

@TypeGraphQL.ObjectType("Feature", {
  isAbstract: true
})
export class Feature {
  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  id!: string;

  @TypeGraphQL.Field(_type => String, {
    nullable: false
  })
  name!: string;

  @TypeGraphQL.Field(_type => FeatureType, {
    nullable: false
  })
  type!: "STRING" | "BOOLEAN" | "NUMBER";

  featureOfRoom?: FeatureOfRoom[];

  featureOfAddress?: FeatureOfAddress[];

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  createdAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: false
  })
  updatedAt!: Date;

  @TypeGraphQL.Field(_type => Date, {
    nullable: true
  })
  deletedDate?: Date | null;

  @TypeGraphQL.Field(_type => Boolean, {
    nullable: true
  })
  deleted?: boolean | null;

  @TypeGraphQL.Field(_type => FeatureCount, {
    nullable: true
  })
  _count?: FeatureCount | null;
}
