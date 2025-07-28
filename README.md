# Frontier

The library helps build modular monolith

## Build configuration

The Builder builds modules one at a time, passing arguments and dependencies to the builder function

```JavaScript
import { Builder, defineModule } from "@atlz253/frontier";
import { Main } from "./src/main/index.js";
import { Orders } from "./src/orders/index.js";
import { Cart, CloudCart } from "./src/cart/index.js";

const modules = new Builder().build({
  modules: {
    main: defineModule({
      builder: (props) => new Main(props), // new Main({ logger: true, debug: false, dependencies: {orders: Orders, cart: Cart}})
      arguments: {
        logger: true,
        debug: false
      },
      dependencies: ["orders", "cart"]
    }),
    orders: defineModule({
      builder: (props) => new Orders(props), // new Orders({db: {...}})
      arguments: {
        db: {
          host: "localhost",
          username: "root",
          password: "12345",
          database: "orders",
        }
      },
    }),
    cart: defineModule({
      builder: (props) => new CloudCart(props), // new CloudCart({dependencies: {fallback: Cart}})
      dependencies: {
        fallback: "cartFallback"
      }
    }),
    cartFallback: defineModule({
      builder: (props) => new Cart(props), // new Cart({dependencies: {orders: Orders}})
      dependencies: ["orders"]
    })
  }
})

modules.get("main").start();
```

### Config overrides

It is possible to transfer several configurations at once, single configuration with overwritten values will be formed based on them

```JavaScript
// several configurations
new Builder.build(
  {
    modules: {
      a: defineModule({
        builder: builder1,
        arguments: { foo: "bar", bar: "baz" },
        dependencies: ["b", "c"],
      }),
    },
  },
  {
    modules: {
      a: defineModule({
        builder: builder2,
        arguments: { foo: "zoo", dee: "gee" },
        dependencies: ["e", "f"],
      }),
    },
  }
)
// equivalent to
new Builder.build(
  modules: {
    a: {
      builder: builder2,
      arguments: { foo: "zoo", bar: "baz", dee: "gee" },
      dependencies: ["e", "f"],
    },
  },
)
```
