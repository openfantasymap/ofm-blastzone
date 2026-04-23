import { BlastZone } from "./BlastZone.js";

const MODULE_ID = "ofm-blastzone";

function resolveTemplate(app) {
    // v13 ApplicationV2: app.document is the MeasuredTemplateDocument
    // v10-v12 FormApplication: app.object is the document, app.object._object is the PlaceableObject
    const doc = app.document ?? app.object;
    return doc?.object ?? doc?._object ?? null;
}

function openBlastDialog(template) {
    const title = game.i18n.localize("blastzone.templateconfig.dialog.title");
    const content = `<p>${game.i18n.localize("blastzone.templateconfig.dialog.content")}</p>`;
    const yes = game.i18n.localize("blastzone.templateconfig.dialog.yes");
    const no = game.i18n.localize("blastzone.templateconfig.dialog.no");

    const run = () => new BlastZone(template).blast();

    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (DialogV2) {
        DialogV2.confirm({
            window: { title },
            content,
            yes: { label: yes, icon: "fas fa-bomb", callback: run },
            no: { label: no }
        });
        return;
    }

    new Dialog({
        title,
        content,
        buttons: {
            yes: { icon: '<i class="fas fa-bomb"></i>', label: yes, callback: run },
            no: { icon: '<i class="fas fa-times"></i>', label: no }
        },
        default: "no"
    }).render(true);
}

function injectButton(app, buttons) {
    const template = resolveTemplate(app);
    if (!template) return;
    buttons.unshift({
        class: "blast-zone",
        icon: "fa fa-bomb",
        label: "Blast!",
        onclick: () => openBlastDialog(template)
    });
}

Hooks.on("getMeasuredTemplateConfigHeaderButtons", injectButton);
// v13 ApplicationV2 header controls hook shape
Hooks.on("getHeaderControlsMeasuredTemplateConfig", injectButton);
