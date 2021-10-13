import { Authorized, Extensions } from "type-graphql"
import { ModelConfig, ModelsEnhanceMap } from "@generated/type-graphql"

const accountEnhanceConfig: ModelConfig<"Account"> = {
    fields: {
        password: [
            Authorized("ADMIN"),
            Extensions({ logMessage: "Danger zone", logLevel: "warn" }),
        ],
    }
}

export const modelsEnhanceMap: ModelsEnhanceMap = {
    Account: accountEnhanceConfig
}