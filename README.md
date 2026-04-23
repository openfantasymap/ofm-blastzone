![](https://img.shields.io/badge/Foundry-v11--v13-informational)

# FantasyMaps Blast Zone

Blow up walls with measured templates. An OFM fork of [theripper93/blastzone](https://github.com/theripper93/blastzone), kept alive for Foundry v11+ and wired into [`ofm-shared-world`](https://github.com/openfantasymap/ofm-shared-world) so a blast in one session propagates to every other GM sharing that world.

Before the blast:

![before](https://user-images.githubusercontent.com/1346839/126155842-a1425d05-5879-4ce4-827d-b5534dc8c8a6.png)

After the blast:

![after](https://user-images.githubusercontent.com/1346839/126155864-9ba01ccf-1c0b-4c4c-8b2c-a45331475003.png)

## Using it

Open any `MeasuredTemplateConfig` dialog — a **Blast!** button is added to the header. Confirming the dialog destroys every wall fully enclosed by the template and clips walls that cross its edges.

![blast button](https://user-images.githubusercontent.com/1346839/126155931-e46e4192-8258-426e-bfe8-d78fcffd142c.png)

## Triggering from a macro

```js
const { BlastZone } = game.modules.get("ofm-blastzone").api;
await new BlastZone(template).blast();
```

`template` can be either a `MeasuredTemplate` placeable or a `MeasuredTemplateDocument`. `blast()` resolves the containing scene and applies the wall changes there — so macros run from a non-viewed scene work too.

The returned object has `{ destroyed, created }` if you want to chain further logic.

## Compatibility

- Foundry **v11 – v13** (verified on v13).
- Supports all four template types: circle, cone, ray, rectangle.
- Emits `ofmSharedWorldChange` with `{ type: "blast", data: polygon }` when the scene has an `ofm` flag set — picked up by `ofm-shared-world`.

## Installing

Manifest URL:

```
https://raw.githubusercontent.com/openfantasymap/ofm-blastzone/master/module.json
```
