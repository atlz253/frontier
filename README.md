# Frontier

The library helps build and manage modular monolith

## Build configuration

The Builder builds modules one at a time, passing arguments and dependencies to the builder function

> ⚠️ **Warning:** all dependencies in dependencies objects will be available only after the completion of the Builder.build method, so you should avoid getting dependencies in builder functions

```JavaScript
import { Builder } from "frontier";
import { Main } from "./src/main/index.js";
import { Orders } from "./src/orders/index.js";
import { Cart } from "./src/cart/index.js";

const modules = new Builder().build({
  modules: {
    main: {
      builder: (props) => new Main(props), // new Main({ logger: true, debug: false, dependencies: {orders: Orders, cart: Cart}})
      arguments: {
        logger: true,
        debug: false
      },
      dependencies: ["orders", "cart"]
    },
    orders: {
      builder: (props) => new Orders(props), // new Orders({db: {...}})
      arguments: {
        db: {
          host: "localhost",
          username: "root",
          password: "12345",
          database: "orders",
        }
      },
    },
    cart: {
      builder: (props) => new Cart(props), // new Cart({dependencies: {orders: Orders}})
      dependencies: ["orders"]
    }
  }
})

modules.get("main").start();
```
