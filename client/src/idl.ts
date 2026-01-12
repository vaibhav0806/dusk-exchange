/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/dusk_exchange.json`.
 */
export type DuskExchange = {
  "address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  "metadata": {
    "name": "duskExchange",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Private Limit Order DEX using Arcium MPC"
  },
  "instructions": [
    {
      "name": "addOrderCallback",
      "docs": [
        "Callback handler for add_order computation"
      ],
      "discriminator": [
        182,
        97,
        173,
        116,
        72,
        20,
        98,
        170
      ],
      "accounts": [
        {
          "name": "callbackAuthority",
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "user"
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "cancelOrder",
      "docs": [
        "Cancel an existing order"
      ],
      "discriminator": [
        95,
        129,
        237,
        240,
        8,
        49,
        223,
        132
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "signPdaAccount",
          "docs": [
            "Signer PDA for CPI to Arcium"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "docs": [
            "Computation definition account for remove_order"
          ]
        },
        {
          "name": "clusterAccount",
          "docs": [
            "Cluster account"
          ],
          "writable": true
        },
        {
          "name": "poolAccount",
          "docs": [
            "Pool account (Arcium fee pool)"
          ],
          "writable": true
        },
        {
          "name": "clockAccount",
          "docs": [
            "Clock account"
          ]
        },
        {
          "name": "arciumProgram",
          "address": "F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deposit",
      "docs": [
        "Deposit tokens into the exchange for trading"
      ],
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "docs": [
            "User's token account to deposit from"
          ],
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Market vault to deposit into (base or quote)"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "isBase",
          "type": "bool"
        }
      ]
    },
    {
      "name": "initAddOrderCompDef",
      "docs": [
        "Initialize the computation definition for adding orders",
        "This must be called once before any orders can be placed"
      ],
      "discriminator": [
        46,
        29,
        225,
        198,
        241,
        238,
        237,
        209
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initMatchBookCompDef",
      "docs": [
        "Initialize the computation definition for matching orders"
      ],
      "discriminator": [
        118,
        183,
        174,
        176,
        38,
        60,
        3,
        197
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initRemoveOrderCompDef",
      "docs": [
        "Initialize the computation definition for removing orders"
      ],
      "discriminator": [
        125,
        107,
        9,
        61,
        17,
        57,
        146,
        168
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "mxeAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "writable": true
        },
        {
          "name": "arciumProgram",
          "address": "F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeMarket",
      "docs": [
        "Initialize a new trading market (e.g., SOL/USDC)"
      ],
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketId"
              }
            ]
          }
        },
        {
          "name": "baseMint",
          "docs": [
            "Base token mint (e.g., wSOL)"
          ]
        },
        {
          "name": "quoteMint",
          "docs": [
            "Quote token mint (e.g., USDC)"
          ]
        },
        {
          "name": "baseVault",
          "docs": [
            "Vault for base tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  115,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "quoteVault",
          "docs": [
            "Vault for quote tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  111,
                  116,
                  101,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "marketId",
          "type": "u64"
        },
        {
          "name": "feeRateBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "matchBookCallback",
      "docs": [
        "Callback handler for match_book computation",
        "Receives revealed execution price and amount"
      ],
      "discriminator": [
        152,
        43,
        227,
        156,
        207,
        59,
        21,
        155
      ],
      "accounts": [
        {
          "name": "callbackAuthority",
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "matched",
          "type": "bool"
        },
        {
          "name": "executionPrice",
          "type": "u64"
        },
        {
          "name": "executionAmount",
          "type": "u64"
        },
        {
          "name": "makerOrderId",
          "type": "u64"
        },
        {
          "name": "takerOrderId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "matchOrders",
      "docs": [
        "Trigger order matching via MPC",
        "Anyone can call this to match crossing orders"
      ],
      "discriminator": [
        17,
        1,
        201,
        93,
        7,
        51,
        251,
        134
      ],
      "accounts": [
        {
          "name": "caller",
          "docs": [
            "Anyone can trigger matching (keeper, user, etc.)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "signPdaAccount",
          "docs": [
            "Signer PDA for CPI to Arcium"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "docs": [
            "Computation definition account for match_book"
          ]
        },
        {
          "name": "clusterAccount",
          "docs": [
            "Cluster account"
          ],
          "writable": true
        },
        {
          "name": "poolAccount",
          "docs": [
            "Pool account (Arcium fee pool)"
          ],
          "writable": true
        },
        {
          "name": "clockAccount",
          "docs": [
            "Clock account"
          ]
        },
        {
          "name": "arciumProgram",
          "address": "F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "placeOrder",
      "docs": [
        "Place an encrypted limit order",
        "Order details (price, amount) are encrypted with Arcium"
      ],
      "discriminator": [
        51,
        194,
        155,
        175,
        109,
        130,
        96,
        106
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "signPdaAccount",
          "docs": [
            "Signer PDA for CPI to Arcium"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  83,
                  105,
                  103,
                  110,
                  101,
                  114,
                  65,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "mxeAccount"
        },
        {
          "name": "mempoolAccount",
          "writable": true
        },
        {
          "name": "executingPool",
          "writable": true
        },
        {
          "name": "computationAccount",
          "writable": true
        },
        {
          "name": "compDefAccount",
          "docs": [
            "Computation definition account for add_order"
          ]
        },
        {
          "name": "clusterAccount",
          "docs": [
            "Cluster account"
          ],
          "writable": true
        },
        {
          "name": "poolAccount",
          "docs": [
            "Pool account (Arcium fee pool)"
          ],
          "writable": true
        },
        {
          "name": "clockAccount",
          "docs": [
            "Clock account"
          ]
        },
        {
          "name": "arciumProgram",
          "address": "F3G6Q9tRicyznCqcZLydJ6RxkwDSBeHWM458J7V6aeyk"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "orderId",
          "type": "u64"
        },
        {
          "name": "isBuy",
          "type": "bool"
        },
        {
          "name": "encryptedPrice",
          "type": "bytes"
        },
        {
          "name": "encryptedAmount",
          "type": "bytes"
        },
        {
          "name": "nonce",
          "type": {
            "array": [
              "u8",
              12
            ]
          }
        }
      ]
    },
    {
      "name": "removeOrderCallback",
      "docs": [
        "Callback handler for remove_order computation"
      ],
      "discriminator": [
        215,
        3,
        120,
        40,
        209,
        230,
        46,
        98
      ],
      "accounts": [
        {
          "name": "callbackAuthority",
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "user"
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "settleTrade",
      "docs": [
        "Settle a matched trade by transferring tokens"
      ],
      "discriminator": [
        252,
        176,
        98,
        248,
        73,
        123,
        8,
        157
      ],
      "accounts": [
        {
          "name": "caller",
          "docs": [
            "Anyone can settle (usually maker, taker, or keeper)"
          ],
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "settlement",
          "writable": true
        },
        {
          "name": "makerPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "settlement.maker",
                "account": "tradeSettlement"
              }
            ]
          }
        },
        {
          "name": "takerPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "settlement.taker",
                "account": "tradeSettlement"
              }
            ]
          }
        },
        {
          "name": "baseVault",
          "docs": [
            "Base token vault"
          ],
          "writable": true
        },
        {
          "name": "quoteVault",
          "docs": [
            "Quote token vault"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "docs": [
        "Withdraw tokens from the exchange"
      ],
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "userPosition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  111,
                  115,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "userTokenAccount",
          "docs": [
            "User's token account to withdraw to"
          ],
          "writable": true
        },
        {
          "name": "vault",
          "docs": [
            "Market vault to withdraw from (base or quote)"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "isBase",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "clockAccount",
      "discriminator": [
        152,
        171,
        158,
        195,
        75,
        61,
        51,
        8
      ]
    },
    {
      "name": "cluster",
      "discriminator": [
        236,
        225,
        118,
        228,
        173,
        106,
        18,
        60
      ]
    },
    {
      "name": "computationDefinitionAccount",
      "discriminator": [
        245,
        176,
        217,
        221,
        253,
        104,
        172,
        200
      ]
    },
    {
      "name": "feePool",
      "discriminator": [
        172,
        38,
        77,
        146,
        148,
        5,
        51,
        242
      ]
    },
    {
      "name": "mxeAccount",
      "discriminator": [
        103,
        26,
        85,
        250,
        179,
        159,
        17,
        117
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "signerAccount",
      "discriminator": [
        127,
        212,
        7,
        180,
        17,
        50,
        249,
        193
      ]
    },
    {
      "name": "tradeSettlement",
      "discriminator": [
        174,
        165,
        72,
        212,
        34,
        9,
        146,
        0
      ]
    },
    {
      "name": "userPosition",
      "discriminator": [
        251,
        248,
        209,
        245,
        83,
        234,
        17,
        27
      ]
    }
  ],
  "events": [
    {
      "name": "deposited",
      "discriminator": [
        111,
        141,
        26,
        45,
        161,
        35,
        100,
        57
      ]
    },
    {
      "name": "marketCreated",
      "discriminator": [
        88,
        184,
        130,
        231,
        226,
        84,
        6,
        58
      ]
    },
    {
      "name": "orderCancelled",
      "discriminator": [
        108,
        56,
        128,
        68,
        168,
        113,
        168,
        239
      ]
    },
    {
      "name": "orderPlaced",
      "discriminator": [
        96,
        130,
        204,
        234,
        169,
        219,
        216,
        227
      ]
    },
    {
      "name": "ordersMatched",
      "discriminator": [
        178,
        8,
        229,
        95,
        192,
        161,
        128,
        196
      ]
    },
    {
      "name": "tradeSettled",
      "discriminator": [
        22,
        119,
        166,
        225,
        175,
        53,
        93,
        216
      ]
    },
    {
      "name": "withdrawn",
      "discriminator": [
        20,
        89,
        223,
        198,
        194,
        124,
        219,
        13
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientBalance",
      "msg": "Insufficient balance for this operation"
    },
    {
      "code": 6001,
      "name": "mathOverflow",
      "msg": "Math overflow occurred"
    },
    {
      "code": 6002,
      "name": "tooManyOrders",
      "msg": "Too many active orders"
    },
    {
      "code": 6003,
      "name": "orderNotFound",
      "msg": "Order not found"
    },
    {
      "code": 6004,
      "name": "invalidOrderParams",
      "msg": "Invalid order parameters"
    },
    {
      "code": 6005,
      "name": "orderAlreadyCancelled",
      "msg": "Order already cancelled"
    },
    {
      "code": 6006,
      "name": "tradeAlreadySettled",
      "msg": "Trade already settled"
    },
    {
      "code": 6007,
      "name": "unauthorized",
      "msg": "Unauthorized operation"
    },
    {
      "code": 6008,
      "name": "marketPaused",
      "msg": "Market is paused"
    },
    {
      "code": 6009,
      "name": "invalidMarketConfig",
      "msg": "Invalid market configuration"
    },
    {
      "code": 6010,
      "name": "orderbookFull",
      "msg": "Orderbook is full"
    },
    {
      "code": 6011,
      "name": "noMatchingOrders",
      "msg": "No matching orders found"
    },
    {
      "code": 6012,
      "name": "selfTrade",
      "msg": "Self-trade prevention"
    },
    {
      "code": 6013,
      "name": "invalidPrice",
      "msg": "Price out of valid range"
    },
    {
      "code": 6014,
      "name": "amountTooSmall",
      "msg": "Amount below minimum"
    },
    {
      "code": 6015,
      "name": "computationNotReady",
      "msg": "Computation not ready"
    },
    {
      "code": 6016,
      "name": "invalidEncryptedData",
      "msg": "Invalid encrypted data"
    },
    {
      "code": 6017,
      "name": "arciumComputationFailed",
      "msg": "Arcium computation failed"
    }
  ],
  "types": [
    {
      "name": "activation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "activationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "deactivationEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          }
        ]
      }
    },
    {
      "name": "bn254g2blsPublicKey",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "array": [
              "u8",
              64
            ]
          }
        ]
      }
    },
    {
      "name": "circuitSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "local",
            "fields": [
              {
                "defined": {
                  "name": "localCircuitSource"
                }
              }
            ]
          },
          {
            "name": "onChain",
            "fields": [
              {
                "defined": {
                  "name": "onChainCircuitSource"
                }
              }
            ]
          },
          {
            "name": "offChain",
            "fields": [
              {
                "defined": {
                  "name": "offChainCircuitSource"
                }
              }
            ]
          }
        ]
      }
    },
    {
      "name": "clockAccount",
      "docs": [
        "An account storing the current network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "startEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "currentEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "startEpochTimestamp",
            "type": {
              "defined": {
                "name": "timestamp"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "cluster",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "maxSize",
            "type": "u32"
          },
          {
            "name": "activation",
            "type": {
              "defined": {
                "name": "activation"
              }
            }
          },
          {
            "name": "maxCapacity",
            "type": "u64"
          },
          {
            "name": "cuPrice",
            "type": "u64"
          },
          {
            "name": "cuPriceProposals",
            "type": {
              "array": [
                "u64",
                32
              ]
            }
          },
          {
            "name": "lastUpdatedEpoch",
            "type": {
              "defined": {
                "name": "epoch"
              }
            }
          },
          {
            "name": "nodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "pendingNodes",
            "type": {
              "vec": {
                "defined": {
                  "name": "nodeRef"
                }
              }
            }
          },
          {
            "name": "blsPublicKey",
            "type": {
              "defined": {
                "name": "setUnset",
                "generics": [
                  {
                    "kind": "type",
                    "type": {
                      "defined": {
                        "name": "bn254g2blsPublicKey"
                      }
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "computationDefinitionAccount",
      "docs": [
        "An account representing a [ComputationDefinition] in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "finalizationAuthority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "cuAmount",
            "type": "u64"
          },
          {
            "name": "definition",
            "type": {
              "defined": {
                "name": "computationDefinitionMeta"
              }
            }
          },
          {
            "name": "circuitSource",
            "type": {
              "defined": {
                "name": "circuitSource"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "computationDefinitionMeta",
      "docs": [
        "A computation definition for execution in a MXE."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "circuitLen",
            "type": "u32"
          },
          {
            "name": "signature",
            "type": {
              "defined": {
                "name": "computationSignature"
              }
            }
          }
        ]
      }
    },
    {
      "name": "computationSignature",
      "docs": [
        "The signature of a computation defined in a [ComputationDefinition]."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "parameters",
            "type": {
              "vec": {
                "defined": {
                  "name": "parameter"
                }
              }
            }
          },
          {
            "name": "outputs",
            "type": {
              "vec": {
                "defined": {
                  "name": "output"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "deposited",
      "docs": [
        "Emitted when tokens are deposited"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "isBase",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "epoch",
      "docs": [
        "The network epoch"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          "u64"
        ]
      }
    },
    {
      "name": "feePool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "localCircuitSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "mxeKeygen"
          }
        ]
      }
    },
    {
      "name": "mxeAccount",
      "docs": [
        "A MPC Execution Environment."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cluster",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "keygenOffset",
            "type": "u64"
          },
          {
            "name": "mxeProgramId",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "utilityPubkeys",
            "type": {
              "defined": {
                "name": "setUnset",
                "generics": [
                  {
                    "kind": "type",
                    "type": {
                      "defined": {
                        "name": "utilityPubkeys"
                      }
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "fallbackClusters",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "rejectedClusters",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "computationDefinitions",
            "type": {
              "vec": "u32"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "market",
      "docs": [
        "Market account representing a trading pair (e.g., SOL/USDC)",
        "Seeds: [\"market\", market_id]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "docs": [
              "Authority that can modify market parameters"
            ],
            "type": "pubkey"
          },
          {
            "name": "baseMint",
            "docs": [
              "Base token mint (e.g., wSOL)"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "docs": [
              "Quote token mint (e.g., USDC)"
            ],
            "type": "pubkey"
          },
          {
            "name": "baseVault",
            "docs": [
              "Token vault for base tokens"
            ],
            "type": "pubkey"
          },
          {
            "name": "quoteVault",
            "docs": [
              "Token vault for quote tokens"
            ],
            "type": "pubkey"
          },
          {
            "name": "marketId",
            "docs": [
              "Unique market identifier"
            ],
            "type": "u64"
          },
          {
            "name": "feeRateBps",
            "docs": [
              "Trading fee in basis points (100 = 1%)"
            ],
            "type": "u16"
          },
          {
            "name": "orderCount",
            "docs": [
              "Counter for generating unique order IDs"
            ],
            "type": "u64"
          },
          {
            "name": "orderbookRef",
            "docs": [
              "Reference to the encrypted orderbook (MXE-managed)"
            ],
            "type": "pubkey"
          },
          {
            "name": "baseLocked",
            "docs": [
              "Total base tokens locked in open orders"
            ],
            "type": "u64"
          },
          {
            "name": "quoteLocked",
            "docs": [
              "Total quote tokens locked in open orders"
            ],
            "type": "u64"
          },
          {
            "name": "activeBids",
            "docs": [
              "Number of active buy orders"
            ],
            "type": "u32"
          },
          {
            "name": "activeAsks",
            "docs": [
              "Number of active sell orders"
            ],
            "type": "u32"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "marketCreated",
      "docs": [
        "Emitted when a new market is created"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "marketId",
            "type": "u64"
          },
          {
            "name": "baseMint",
            "type": "pubkey"
          },
          {
            "name": "quoteMint",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "feeRateBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "nodeRef",
      "docs": [
        "A reference to a node in the cluster.",
        "The offset is to derive the Node Account.",
        "The current_total_rewards is the total rewards the node has received so far in the current",
        "epoch."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "offset",
            "type": "u32"
          },
          {
            "name": "currentTotalRewards",
            "type": "u64"
          },
          {
            "name": "vote",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "offChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "source",
            "type": "string"
          },
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "onChainCircuitSource",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isCompleted",
            "type": "bool"
          },
          {
            "name": "uploadAuth",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "orderCancelled",
      "docs": [
        "Emitted when an order is cancelled"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "orderId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "orderPlaced",
      "docs": [
        "Emitted when an order is placed",
        "Note: Price and amount are NOT included (encrypted)"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "orderId",
            "type": "u64"
          },
          {
            "name": "isBuy",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "docs": [
              "Timestamp when order was submitted"
            ],
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "ordersMatched",
      "docs": [
        "Emitted when orders are matched",
        "This reveals execution details after the match"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "taker",
            "type": "pubkey"
          },
          {
            "name": "makerOrderId",
            "type": "u64"
          },
          {
            "name": "takerOrderId",
            "type": "u64"
          },
          {
            "name": "executionPrice",
            "docs": [
              "Revealed execution price (scaled by 10^6)"
            ],
            "type": "u64"
          },
          {
            "name": "executionAmount",
            "docs": [
              "Revealed execution amount (base tokens)"
            ],
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "output",
      "docs": [
        "An output of a computation.",
        "We currently don't support encrypted outputs yet since encrypted values are passed via",
        "data objects."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisX25519Pubkey"
          },
          {
            "name": "plaintextFloat"
          },
          {
            "name": "plaintextPoint"
          },
          {
            "name": "plaintextI8"
          },
          {
            "name": "plaintextI16"
          },
          {
            "name": "plaintextI32"
          },
          {
            "name": "plaintextI64"
          },
          {
            "name": "plaintextI128"
          }
        ]
      }
    },
    {
      "name": "parameter",
      "docs": [
        "A parameter of a computation.",
        "We differentiate between plaintext and encrypted parameters and data objects.",
        "Plaintext parameters are directly provided as their value.",
        "Encrypted parameters are provided as an offchain reference to the data.",
        "Data objects are provided as a reference to the data object account."
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "plaintextBool"
          },
          {
            "name": "plaintextU8"
          },
          {
            "name": "plaintextU16"
          },
          {
            "name": "plaintextU32"
          },
          {
            "name": "plaintextU64"
          },
          {
            "name": "plaintextU128"
          },
          {
            "name": "ciphertext"
          },
          {
            "name": "arcisX25519Pubkey"
          },
          {
            "name": "arcisSignature"
          },
          {
            "name": "plaintextFloat"
          },
          {
            "name": "plaintextI8"
          },
          {
            "name": "plaintextI16"
          },
          {
            "name": "plaintextI32"
          },
          {
            "name": "plaintextI64"
          },
          {
            "name": "plaintextI128"
          },
          {
            "name": "plaintextPoint"
          }
        ]
      }
    },
    {
      "name": "setUnset",
      "docs": [
        "Utility struct to store a value that needs to be set by a certain number of participants (keys",
        "in our case). Once all participants have set the value, the value is considered set and we only",
        "store it once."
      ],
      "generics": [
        {
          "kind": "type",
          "name": "t"
        }
      ],
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "set",
            "fields": [
              {
                "generic": "t"
              }
            ]
          },
          {
            "name": "unset",
            "fields": [
              {
                "generic": "t"
              },
              {
                "vec": "bool"
              }
            ]
          }
        ]
      }
    },
    {
      "name": "signerAccount",
      "docs": [
        "SignerAccount for the Arcium CPI signing PDA",
        "9 bytes: 8 for discriminator + 1 for bump"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "timestamp",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "timestamp",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tradeSettled",
      "docs": [
        "Emitted when a trade is settled"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "settlement",
            "type": "pubkey"
          },
          {
            "name": "maker",
            "type": "pubkey"
          },
          {
            "name": "taker",
            "type": "pubkey"
          },
          {
            "name": "baseTransferred",
            "type": "u64"
          },
          {
            "name": "quoteTransferred",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tradeSettlement",
      "docs": [
        "Trade settlement account created when orders are matched",
        "Contains revealed execution details",
        "Seeds: [\"settlement\", market, maker_order_id, taker_order_id]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "docs": [
              "Market where the trade occurred"
            ],
            "type": "pubkey"
          },
          {
            "name": "maker",
            "docs": [
              "Maker (limit order that was resting)"
            ],
            "type": "pubkey"
          },
          {
            "name": "taker",
            "docs": [
              "Taker (order that crossed the spread)"
            ],
            "type": "pubkey"
          },
          {
            "name": "makerOrderId",
            "docs": [
              "Maker's order ID"
            ],
            "type": "u64"
          },
          {
            "name": "takerOrderId",
            "docs": [
              "Taker's order ID"
            ],
            "type": "u64"
          },
          {
            "name": "executionPrice",
            "docs": [
              "Revealed execution price (scaled by 10^6)"
            ],
            "type": "u64"
          },
          {
            "name": "executionAmount",
            "docs": [
              "Revealed execution amount (base tokens)"
            ],
            "type": "u64"
          },
          {
            "name": "makerIsBuy",
            "docs": [
              "Whether maker was buying (true) or selling (false)"
            ],
            "type": "bool"
          },
          {
            "name": "settled",
            "docs": [
              "Whether this trade has been settled"
            ],
            "type": "bool"
          },
          {
            "name": "matchedAt",
            "docs": [
              "Timestamp of the match"
            ],
            "type": "i64"
          },
          {
            "name": "settledAt",
            "docs": [
              "Timestamp of settlement (0 if not settled)"
            ],
            "type": "i64"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userPosition",
      "docs": [
        "User position account tracking deposits and orders for a specific market",
        "Seeds: [\"user_position\", market, owner]"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "docs": [
              "Owner of this position"
            ],
            "type": "pubkey"
          },
          {
            "name": "market",
            "docs": [
              "Market this position belongs to"
            ],
            "type": "pubkey"
          },
          {
            "name": "baseDeposited",
            "docs": [
              "Total base tokens deposited (available + locked in orders)"
            ],
            "type": "u64"
          },
          {
            "name": "quoteDeposited",
            "docs": [
              "Total quote tokens deposited (available + locked in orders)"
            ],
            "type": "u64"
          },
          {
            "name": "baseLocked",
            "docs": [
              "Base tokens currently locked in open sell orders"
            ],
            "type": "u64"
          },
          {
            "name": "quoteLocked",
            "docs": [
              "Quote tokens currently locked in open buy orders"
            ],
            "type": "u64"
          },
          {
            "name": "activeOrderCount",
            "docs": [
              "Number of active orders"
            ],
            "type": "u8"
          },
          {
            "name": "bump",
            "docs": [
              "PDA bump seed"
            ],
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "utilityPubkeys",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "x25519Pubkey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "ed25519VerifyingKey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "elgamalPubkey",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "pubkeyValidityProof",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          }
        ]
      }
    },
    {
      "name": "withdrawn",
      "docs": [
        "Emitted when tokens are withdrawn"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "isBase",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
