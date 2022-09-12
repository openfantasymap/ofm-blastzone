# FantasyMaps Blastzone
Based on theripper93's original FoundryVTT BlastZone, it integrates with FantasyMaps Shared World system. 

## The most dangerous module on foundry
Blast away those pesky walls using templates

Before the blast

![image](https://user-images.githubusercontent.com/1346839/126155842-a1425d05-5879-4ce4-827d-b5534dc8c8a6.png)

After the blast

![image](https://user-images.githubusercontent.com/1346839/126155864-9ba01ccf-1c0b-4c4c-8b2c-a45331475003.png)

Click the blast button in the template window - a confirmation dialog will appear before the blast happens

![image](https://user-images.githubusercontent.com/1346839/126155931-e46e4192-8258-426e-bfe8-d78fcffd142c.png)

Trigger via macro:

```js
let blast = new BlastZone(template)
blast.blast()
```
