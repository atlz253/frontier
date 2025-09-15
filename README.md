# Frontier

The library helps build modular monolith

## Build configuration

The Builder builds modules one at a time, passing arguments and dependencies to the builder function

```JavaScript
import { Builder, defineModule, classBuilder } from "@atlz253/frontier";
import { initMain } from "./src/main/index.js";
import { Orders } from "./src/orders/index.js";
import { Cart, CloudCart } from "./src/cart/index.js";

const modules = new Builder().build({
  modules: {
    main: defineModule({
      builder: initMain, // initMain({ logger: true, debug: false, dependencies: {orders: Orders, cart: Cart}})
      arguments: {
        logger: true,
        debug: false
      },
      dependencies: ["orders", "cart"]
    }),
    orders: defineModule({
      builder: classBuilder(Orders), // new Orders({db: {...}})
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
      builder: classBuilder(CloudCart), // new CloudCart({dependencies: {fallback: Cart}})
      dependencies: {
        fallback: "cartFallback"
      }
    }),
    cartFallback: defineModule({
      builder: classBuilder(Cart), // new Cart({dependencies: {orders: Orders}})
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
        arguments: { foo: "bar", bar: "baz", o: {a: "a", b: "b"} },
        dependencies: ["b", "c"],
      }),
    },
  },
  {
    modules: {
      a: defineModule({
        builder: builder2,
        arguments: { foo: "zoo", dee: "gee", o: {b: "o", c: "c"} },
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
      arguments: { foo: "zoo", bar: "baz", dee: "gee", o: {a: "a", b: "o", c: "c"} },
      dependencies: ["e", "f"],
    },
  },
)
```
