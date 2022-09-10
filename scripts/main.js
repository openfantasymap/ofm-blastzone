import {BlastZone} from "./BlastZone.js";


class BlastZoneLauncher extends Application{
    constructor(object, options){
        super(object, options);

        Hooks.once('init', async function() {
            


        });
        
        Hooks.once('ready', async function() {
            
        });
        Hooks.on("getMeasuredTemplateConfigHeaderButtons", async (app, buttons) => {            
            console.log(app, buttons);
            if (app.object) {
              buttons.unshift({
                class: 'blast-zone',
                icon: 'fa fa-bomb',
                label: 'Blast!',
                onclick: () => {
                    new Dialog({
                        title: game.i18n.localize("blastzone.templateconfig.dialog.title"),
                        content: "<p>"+game.i18n.localize("blastzone.templateconfig.dialog.content")+"<br></p>",
                        buttons: {
                          one: {
                            icon: '<i class="fas fa-bomb"></i>',
                            label: game.i18n.localize("blastzone.templateconfig.dialog.yes"),
                            callback: () => {
                              let blast = new BlastZone(app.object._object);
                              blast.blast();
                            },
                          },
                          two: {
                            icon: '<i class="fas fa-times"></i>',
                            label: game.i18n.localize("blastzone.templateconfig.dialog.no"),
                            callback: () => {
                
                            },
                          },
                        },
                        default: "two",
                      }).render(true);
                },
              });
            }
            
            
        });

    }
}
const blastzone = new BlastZoneLauncher();