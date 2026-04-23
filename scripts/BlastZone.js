// Read either the PlaceableObject directly or fall back to its document.
function td(template) {
    return template.document ?? template;
}

function wd(wall) {
    return wall.document ?? wall;
}

class TemplateGeometry {
    constructor(template) {
        this.template = template;
        this.scene = template.scene;
        this.polygon = TemplateGeometry.getPolygon(template);
    }

    static getPolygon(template) {
        const t = td(template).t;
        switch (t) {
            case CONST.MEASURED_TEMPLATE_TYPES.CIRCLE:
                return TemplateGeometry.getCircle(template);
            case CONST.MEASURED_TEMPLATE_TYPES.CONE:
                return TemplateGeometry.getCone(template);
            case CONST.MEASURED_TEMPLATE_TYPES.RAY:
                return TemplateGeometry.getRay(template);
            case CONST.MEASURED_TEMPLATE_TYPES.RECTANGLE:
                return TemplateGeometry.getRectangle(template);
            default:
                return null;
        }
    }

    static getCircle(template) {
        const d = td(template);
        const radius = d.distance * TemplateGeometry.unitToPx();
        const segments = 36;
        const points = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            points.push(d.x + Math.cos(angle) * radius);
            points.push(d.y + Math.sin(angle) * radius);
        }
        // close the loop
        points.push(points[0], points[1]);
        return new PIXI.Polygon(points);
    }

    static getCone(template) {
        const d = td(template);
        // PlaceableObject.shape is a PIXI.Polygon whose points are local to (d.x, d.y)
        const shape = template.shape ?? template.object?.shape;
        const points = [];
        for (let i = 0; i < shape.points.length; i += 2) {
            points.push(shape.points[i] + d.x);
            points.push(shape.points[i + 1] + d.y);
        }
        return new PIXI.Polygon(points);
    }

    static getRectangle(template) {
        const d = td(template);
        const ray = template.ray ?? template.object?.ray;
        return new PIXI.Polygon([
            d.x,           d.y,
            d.x + ray.dx,  d.y,
            d.x + ray.dx,  d.y + ray.dy,
            d.x,           d.y + ray.dy,
            d.x,           d.y
        ]);
    }

    static getRay(template) {
        const d = td(template);
        const ray = template.ray ?? template.object?.ray;
        const o = ray.A;
        const wp = (d.width * TemplateGeometry.unitToPx()) / 2;
        const c1 = ray.B;
        const dist = d.distance * TemplateGeometry.unitToPx();
        const pts = [
            { x: o.x + (wp * (o.y - c1.y)) / dist,  y: o.y - (wp * (o.x - c1.x)) / dist },
            { x: o.x - (wp * (o.y - c1.y)) / dist,  y: o.y + (wp * (o.x - c1.x)) / dist },
            { x: c1.x - (wp * (o.y - c1.y)) / dist, y: c1.y + (wp * (o.x - c1.x)) / dist },
            { x: c1.x + (wp * (o.y - c1.y)) / dist, y: c1.y - (wp * (o.x - c1.x)) / dist }
        ];
        const flat = [];
        for (const p of pts) flat.push(p.x, p.y);
        flat.push(pts[0].x, pts[0].y);
        return new PIXI.Polygon(flat);
    }

    static unitToPx() {
        return canvas.dimensions.size / canvas.dimensions.distance;
    }

    static lineLineIntersection(l1, l2) {
        const { x1, y1, x2, y2 } = l1;
        const { x1: x3, y1: y3, x2: x4, y2: y4 } = l2;
        const eps = 1e-7;
        const between = (a, b, c) => a - eps <= b && b <= c + eps;
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return false;
        const x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
        if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
        const inX1 = x1 >= x2 ? between(x2, x, x1) : between(x1, x, x2);
        const inY1 = y1 >= y2 ? between(y2, y, y1) : between(y1, y, y2);
        const inX2 = x3 >= x4 ? between(x4, x, x3) : between(x3, x, x4);
        const inY2 = y3 >= y4 ? between(y4, y, y3) : between(y3, y, y4);
        if (!inX1 || !inY1 || !inX2 || !inY2) return false;
        return { x, y };
    }

    getIntersection(wall) {
        const c = wd(wall).c;
        const line1 = { x1: c[0], y1: c[1], x2: c[2], y2: c[3] };
        const intersections = [];
        for (let i = 0; i < this.polygon.points.length - 2; i += 2) {
            const line2 = {
                x1: this.polygon.points[i],
                y1: this.polygon.points[i + 1],
                x2: this.polygon.points[i + 2],
                y2: this.polygon.points[i + 3]
            };
            const hit = TemplateGeometry.lineLineIntersection(line1, line2);
            if (hit) intersections.push(hit);
        }
        return intersections;
    }

    isInside(wall) {
        const c = wd(wall).c;
        return this.polygon.contains(c[0], c[1]) && this.polygon.contains(c[2], c[3]);
    }

    isOutside(wall) {
        const c = wd(wall).c;
        return !this.polygon.contains(c[0], c[1]) && !this.polygon.contains(c[2], c[3]);
    }

    static getDistance(p1, p2) {
        return Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }
}

function baseWallData(wall, c) {
    return {
        c,
        move: CONST.WALL_MOVEMENT_TYPES?.NORMAL ?? 1,
        sight: CONST.WALL_SENSE_TYPES?.NORMAL ?? 1,
        sound: CONST.WALL_SENSE_TYPES?.NORMAL ?? 1,
        dir: CONST.WALL_DIRECTIONS?.BOTH ?? 0,
        door: CONST.WALL_DOOR_TYPES?.NONE ?? 0,
        ds: CONST.WALL_DOOR_STATES?.CLOSED ?? 0,
        flags: wd(wall).flags ?? {}
    };
}

export class BlastZone {
    constructor(template) {
        this.template = template;
        this.wallsToDestroy = [];
        this.wallsToCreate = [];
    }

    computeWalls() {
        this.templateGeometry = new TemplateGeometry(this.template);
        if (!this.templateGeometry.polygon) return;

        for (const wall of canvas.walls.placeables) {
            const c = wd(wall).c;
            if (this.templateGeometry.isInside(wall)) {
                this.wallsToDestroy.push(wall.id);
                continue;
            }
            const intersections = this.templateGeometry.getIntersection(wall);
            if (this.templateGeometry.isOutside(wall) && intersections.length === 0) continue;

            if (intersections.length === 1) {
                const outside = this.templateGeometry.polygon.contains(c[0], c[1])
                    ? { x: c[2], y: c[3] }
                    : { x: c[0], y: c[1] };
                this.wallsToDestroy.push(wall.id);
                this.wallsToCreate.push(baseWallData(wall, [
                    outside.x, outside.y, intersections[0].x, intersections[0].y
                ]));
            } else if (intersections.length === 2) {
                const start = { x: c[0], y: c[1] };
                const end = { x: c[2], y: c[3] };
                const d0 = TemplateGeometry.getDistance(intersections[0], start);
                const d1 = TemplateGeometry.getDistance(intersections[1], start);
                const [nearStart, nearEnd] = d0 < d1
                    ? [intersections[0], intersections[1]]
                    : [intersections[1], intersections[0]];
                this.wallsToDestroy.push(wall.id);
                this.wallsToCreate.push(baseWallData(wall, [start.x, start.y, nearStart.x, nearStart.y]));
                this.wallsToCreate.push(baseWallData(wall, [end.x, end.y, nearEnd.x, nearEnd.y]));
            }
        }

        const scene = td(this.template).parent ?? this.template.scene;
        if (scene?.flags?.ofm) {
            Hooks.call('ofmSharedWorldChange', {
                event: { type: "blast", data: this.templateGeometry.polygon },
                scene
            });
        }
    }

    async blast() {
        this.computeWalls();
        const scene = td(this.template).parent ?? this.template.scene ?? canvas.scene;
        if (this.wallsToCreate.length) await scene.createEmbeddedDocuments("Wall", this.wallsToCreate);
        if (this.wallsToDestroy.length) await scene.deleteEmbeddedDocuments("Wall", this.wallsToDestroy);
        return { destroyed: this.wallsToDestroy, created: this.wallsToCreate };
    }
}

// Macro convenience: `new game.modules.get("ofm-blastzone").api.BlastZone(template).blast()`
Hooks.once("ready", () => {
    const mod = game.modules.get("ofm-blastzone");
    if (mod) mod.api = { BlastZone };
});
