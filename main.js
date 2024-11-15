const playerImage = new Image();
playerImage.src = './images/player/Player.png';

const treeImage = new Image();
treeImage.src = './images/objects/Tree.png';
const bushImage = new Image();
bushImage.src = './images/objects/Bush.png';
const boulderImage = new Image();
boulderImage.src = './images/objects/Boulder.png';
const firePitImage = new Image();
firePitImage.src = './images/objects/FirePit.png';



const eqHandImage = new Image();
eqHandImage.src = './images/gui/eqHand.png';
const eqBodyImage = new Image();
eqBodyImage.src = './images/gui/eqBody.png';
const eqHeadImage = new Image();
eqHeadImage.src = './images/gui/eqHead.png';
const arrowRightImage = new Image();
arrowRightImage.src = './images/gui/ArrowRight.png'


const aCornImage = new Image();
aCornImage.src = './images/items/Acorn.png';
const stickImage = new Image();
stickImage.src = './images/items/Stick.png';
const rockImage = new Image();
rockImage.src = './images/items/Rock.png'
const woodImage = new Image();
woodImage.src = './images/items/Wood.png'

const axeImage = new Image();
axeImage.src = './images/items/Axe.png'
const pickaxeImage = new Image();
pickaxeImage.src = './images/items/Pickaxe.png'

const numbersImage = new Image();
numbersImage.src = './images/gui/liczby.png';
const craftingImage = new Image();
craftingImage.src ='./images/gui/crafting.png'
const foodImage = new Image();
foodImage.src = './images/gui/Food.png';
const hearthImage = new Image();
hearthImage.src = './images/gui/Hearth.png';
const lightImage = new Image();
lightImage.src = './images/gui/Light.png';





const mapWidth = 100;
const mapHeight = 100;
const viewWidth = 23;
const viewHeight = 15;
const cellWidth = 48;

const canvas = document.getElementById('myCanvas');
canvas.width = viewWidth * cellWidth; 
canvas.height = viewHeight * cellWidth;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

let button = false

let selectedItem = null;
let selectedItemIndex = null;

let frameCounter = 0;

class Gracz {
    constructor(x, y, image) {
        this.x = x;
        this.y = y;
        this.image = image;
        
        this.eq = new Array(16).fill(null);
        this.hand = null;
        this.body = null;
        this.head = null;

        this.hp = 150;
        this.maxHp = 150;

        this.hunger = 150;
        this.maxHunger = 150;

        this.hungerTimer = setInterval(() => {
            if (this.hunger > 0) {
                this.hunger--;
            } else {
                this.hp--
            }
        }, 4000);

        this.light = 150;
        this.maxLight = 150;

        this.animationFrame = 0;

        this.surroundingObjects = [];
    }

    updateAnimation(frameCounter) {
        if (frameCounter % 15 == 0) {
            this.animationFrame = (this.animationFrame + 1) % 2;
            this.updateSurroundingObjects()   
        }
        if (frameCounter % 60 == 0) {

            const firePit = this.surroundingObjects.find(object => object.name === 'firePit');
        
            if (firePit) {
                g1.light = Math.min(g1.light + 2, g1.maxLight);
            } else if (this.light > 0) {
                this.light--;
            } 
        }
    }

    draw(ctx, offsetX, offsetY) {
        const spriteWidth = this.image.width / 2;
        const spriteHeight = this.image.height;
        const sourceX = this.animationFrame * spriteWidth;

        ctx.drawImage(
            this.image,
            sourceX, 0, spriteWidth, spriteHeight,
            (this.x - offsetX) * cellWidth, (this.y - offsetY) * cellWidth, cellWidth, cellWidth
        );
    }
    canFitInEQ(itemType, quantity) {
        const item = items[itemType];
        // Sprawdź, czy istnieje jakiekolwiek miejsce w ekwipunku.
        let emptySlotAvailable = false;
        let spaceForStackableItem = false;
        let stackableSlot = null;
    
        for (let i = 0; i < this.eq.length; i++) {
            const slot = this.eq[i];
            
            // Jeżeli slot jest pusty, to mamy miejsce na przedmiot.
            if (slot === null) {
                emptySlotAvailable = true;
            }
    
            // Jeśli przedmiot w slocie to ten sam, a jego ilość nie osiągnęła maksymalnego stosu
            if (slot && slot.isSameAs(item) && slot.quantity < slot.maxStack) {
                spaceForStackableItem = true;
                stackableSlot = i;  // Zapamiętaj slot, w którym można dodać przedmiot.
            }
        }
    
        // Jeśli przedmiot jest stosowalny i mamy miejsce na stos (większy niż maxStack)
        if (spaceForStackableItem && quantity <= item.maxStack - this.eq[stackableSlot].quantity) {
            return true;
        }
        
        // Jeśli istnieje puste miejsce w ekwipunku (lub miejsce na stackable przedmiot)
        return emptySlotAvailable || spaceForStackableItem;
    }
    addItemToEQ(itemType, quantity) {
        const item = items[itemType];
        for (let i = 0; i < quantity; i++) {
            let addedToStack = false;
    
            for (let j = 0; j < this.eq.length; j++) {
                if (this.eq[j] && this.eq[j].isSameAs(item)) {
                    if (this.eq[j].quantity < this.eq[j].maxStack) {
                        this.eq[j].addToStack(1); 
                        addedToStack = true; 
                        break; 
                    }
                }
            }
    
            if (!addedToStack) {
                const emptySlotIndex = this.eq.findIndex(slot => slot === null);
                if (emptySlotIndex !== -1) {
                    this.eq[emptySlotIndex] = new Item(item.image, 1, item.maxStack, item.name, item.useable, item.onPlace);
                } else {
                    console.log(`Nie można dodać pozostałych ${quantity - i} jednostek przedmiotu - brak miejsca.`);
                    break; 
                }
            }
        }
    }

    deleteFromInventory(index, quantity = null) {
        const item = this.eq[index];
        if (!item) {
            console.log(`Brak przedmiotu w slocie ${index}.`);
            return;
        }

        // Jeśli quantity jest null lub jest większe lub równe ilości w stosie, usuń cały stos
        if (quantity === null) {
            this.eq[index] = null;
        } else {
            // W przeciwnym razie zmniejsz ilość przedmiotu w slocie
            item.quantity -= quantity;
            if (item.quantity <= 0) {
                this.eq[index] = null
            }
        }
    }

    // Funkcja usuwająca przedmioty na podstawie ich typu (nazwa)
    deleteFromCrafts(itemType, quantity) {
        for (let i = 0; i < this.eq.length; i++) {
            const item = this.eq[i];
            if (item && item.name === itemType) {
                if (quantity >= item.quantity) {
                    // Usuń cały stos przedmiotu
                    quantity -= item.quantity;
                    this.eq[i] = null;
                } else {
                    // Usuń część stosu i zakończ
                    item.quantity -= quantity;
                    quantity = 0;
                }
                
                // Przerwij, jeśli usunięto wymaganą ilość
                if (quantity <= 0) return;
            }
        }
        
        if (quantity > 0) {
            console.log(`Brak wystarczającej ilości ${itemType} do usunięcia.`);
        }
    }
    craft(itemName) {
        console.log(crafts)
        const recipe = crafts[itemName];
        if (recipe) {
            console.log(recipe.type)
        }
        
        // Sprawdź, czy przepis istnieje w craftsList
        if (!recipe.recipe) {
            console.log(`Przedmiot o nazwie ${itemName} nie istnieje w craftingu.`);
            return;
        }

        // Sprawdź, czy gracz posiada wszystkie wymagane składniki
        for (const ingredient in recipe.recipe) {
            const requiredAmount = recipe.recipe[ingredient];
            const availableAmount = this.eq.reduce((total, item) => {
                return item && item.name === ingredient ? total + item.quantity : total;
            }, 0);

            if (availableAmount < requiredAmount) {
                console.log(`Brakuje ${requiredAmount - availableAmount} sztuk składnika ${ingredient}.`);
                return;
            }
        }
        if (recipe.type == "item") {
            // Usuń wymagane składniki z ekwipunku
            for (const ingredient in recipe.recipe) {
                const requiredAmount = recipe.recipe[ingredient];
                this.deleteFromCrafts(ingredient, requiredAmount);
            }

            // Dodaj przedmiot do ekwipunku
            this.addItemToEQ(itemName, 1);
            console.log(`Udało się stworzyć przedmiot: ${itemName}`);
            selectedCraft = -1
        } else if (recipe.type == "wall") {
            const craftNames = Object.keys(crafts);
            let selectedCraftName = craftNames[selectedCraft];
            const wallModel = wallModels[selectedCraftName]
            // Jeśli pole jest dostępne, tworzysz nowy obiekt "wall" na tym polu
            const newWall = new Ściana(
                g1.x,
                g1.y,
                wallModel.name, 
                wallModel.image, 
                wallModel.interaction, 
                wallModel.isPassable,
                wallModel.framesPerRow,
                wallModel.frameInterval,
                wallModel.hitLimit,
                wallModel.cooldown,
                wallModel.hp,
                wallModel.maxHp,
                wallModel.onDestroy,
                wallModel.onUpdate,
            );
        
            mapa.push(newWall); // Dodajemy ścianę na mapę
            console.log(`Udało się stworzyć ścianę na polu (${g1.x}, ${g1.y})`);
    
            for (const ingredient in recipe.recipe) {
                const requiredAmount = recipe.recipe[ingredient];
                this.deleteFromCrafts(ingredient, requiredAmount);
            }
            selectedCraft = -1        
        }
    }

    
    equipHand(item, index) {
        if (!this.hand) {
        
            this.hand = item;
            this.deleteFromInventory(index)
        } else if (this.hand.name == item.name){
            if (this.hand.maxStack > this.hand.quantity) {
                if (this.hand.maxStack > this.hand.quantity + this.eq[index].quantity) {
                    this.hand.quantity += this.eq[index].quantity
                    this.deleteFromInventory(index)
                } else {
                    this.eq[index].quantity = this.hand.maxStack - (this.hand.maxStack - this.hand.quantity)
                    this.hand.quantity = this.hand.maxStack
                }
            }
        } else {
            let storage = this.eq[index]
            this.eq[index] = this.hand
            this.hand = storage
        }
    }

    equipBody(item, index) {
        if (!this.body) {
        
            this.body = item;
            this.deleteFromInventory(index)
        } else if (this.body.name == item.name){
            if (this.body.maxStack > this.body.quantity) {
                if (this.body.maxStack > this.body.quantity + this.eq[index].quantity) {
                    this.body.quantity += this.eq[index].quantity
                    this.deleteFromInventory(index)
                } else {
                    this.eq[index].quantity = this.body.maxStack - (this.body.maxStack - this.body.quantity)
                    this.body.quantity = this.body.maxStack
                }
            }
        } else {
            let storage = this.eq[index]
            this.eq[index] = this.body
            this.body = storage
        }
    }

    equipHead(item, index) {
        if (!this.head) {
        
            this.head = item;
            this.deleteFromInventory(index)
        } else if (this.head.name == item.name){
            if (this.head.maxStack > this.head.quantity) {
                if (this.head.maxStack > this.head.quantity + this.eq[index].quantity) {
                    this.head.quantity += this.eq[index].quantity
                    this.deleteFromInventory(index)
                } else {
                    this.eq[index].quantity = this.head.maxStack - (this.head.maxStack - this.head.quantity)
                    this.head.quantity = this.head.maxStack
                }
            }
        } else {
            let storage = this.eq[index]
            this.eq[index] = this.head
            this.head = storage
        }
    }

    unequipHand() {
        if (this.hand) {
            if (this.canFitInEQ(this.hand.name,this.hand.quantity)) {
                this.addItemToEQ(this.hand.name, this.hand.quantity)
                this.hand = null;
            }
        }
    }

    unequipBody() {
        if (this.body) {
            if (this.canFitInEQ(this.body.name,this.body.quantity)) {
                this.addItemToEQ(this.body.name, this.body.quantity)
                this.body = null;
            }
        }
    }

    unequipHead() {
        if (this.head) {
            if (this.canFitInEQ(this.head.name,this.head.quantity)) {
                this.addItemToEQ(this.head.name, this.head.quantity)
                this.head = null;
            }
        }
    }

    deleteFromHand(quantity) {
        if (quantity === null) {
            this.hand = null;
        } else {
            this.hand.quantity -= quantity;
            if (this.hand.quantity <= 0) {
                this.hand = null
            }
        }
    }

    updateSurroundingObjects() {
        // Definiujemy współrzędne 4 pobliskich pól i ukosów
        const surroundingTiles = [
            { x: this.x, y: this.y - 1 }, // Nad graczem
            { x: this.x + 1, y: this.y }, // Po prawej
            { x: this.x, y: this.y + 1 }, // Pod graczem
            { x: this.x - 1, y: this.y }, // Po lewej
    
            { x: this.x - 1, y: this.y - 1 }, // Lewy górny ukos
            { x: this.x + 1, y: this.y - 1 }, // Prawy górny ukos
            { x: this.x - 1, y: this.y + 1 }, // Lewy dolny ukos
            { x: this.x + 1, y: this.y + 1 }  // Prawy dolny ukos
        ];
    
        // Wyczyszczamy tablicę przed ponownym zapełnieniem
        this.surroundingObjects = [];
    
        surroundingTiles.forEach(tile => {
            // Sprawdzamy, czy istnieje obiekt na tym polu
            const objectOnTile = mapa.find(thing => thing.x === tile.x && thing.y === tile.y);
            
            // Jeśli obiekt istnieje, dodajemy go do tablicy surroundingObjects
            if (objectOnTile) {
                this.surroundingObjects.push(objectOnTile);
            }
        });
    }
}

class Ściana {
    constructor(x, y, name, image, interaction, isPassable = false, framesPerRow = 2, frameInterval = 4, hitLimit = 3, cooldown = 500, hp = 1, maxHp = hp, onDestroy = null, onUpdate = null) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.image = image;
        this.interaction = interaction;
        this.isPassable = isPassable; // Nowy parametr kontrolujący możliwość przejścia przez obiekt

        this.framesPerRow = framesPerRow; // liczba klatek w rzędzie
        this.frameInterval = frameInterval; // interwał zmiany klatek

        this.hitCounter = hitLimit; // licznik trafień
        this.actualHitCounter = hitLimit;

        this.cooldown = false; // status chłodzenia
        this.cooldownDuration = cooldown; // czas chłodzenia w milisekundach
        this.cooldownStart = 0; // czas rozpoczęcia chłodzenia
        
        this.hp = hp
        this.maxHp = maxHp

        this.animationFrame = 0;

        this.onDestroy = onDestroy

        this.onUpdate = onUpdate
        this.timeCounter = 0;
    }

    updateAnimation(frameCounter) {
        if (frameCounter % 30 / this.framesPerRow == 0) {
            this.animationFrame = (this.animationFrame + 1) % this.framesPerRow;
        }
    }

    draw(ctx, offsetX, offsetY) {
        const spriteWidth = this.image.width / this.framesPerRow; // Szerokość pojedynczej klatki
        const spriteHeight = this.image.height / 2;
        const sourceX = this.animationFrame * spriteWidth;
        const row = this.cooldown ? 1 : 0;
        const sourceY = row * spriteHeight;

        ctx.drawImage(
            this.image,
            sourceX, sourceY, spriteWidth, spriteHeight,
            (this.x - offsetX) * cellWidth, (this.y - offsetY) * cellWidth, cellWidth, cellWidth
        );
    }

    onHit() {
        if (typeof this.interaction == "function") {
            if (this.cooldown) return; // Nie pozwól na trafienie, jeśli jest w czasie chłodzenia

            if (this.actualHitCounter > 0) {
                this.interaction();
                if (this.hp == 0) {
                    this.destroy()
                    return
                }

                if (this.actualHitCounter === 0) {
                    this.startCooldown();
                }
            }
        }
        return
    }
    destroy() {
        mapa = mapa.filter(obj => 
            (obj.x !== this.x || obj.y !== this.y || obj.image !== this.image)
        );
        if (typeof this.onDestroy == "function") {
            this.onDestroy()
        }
        
    }

    startCooldown() {
        this.cooldown = true;
        this.cooldownStart = Date.now();

        // Ustaw timeout do zakończenia chłodzenia
        setTimeout(() => {
            this.resetHitCounter();
        }, this.cooldownDuration);
    }

    resetHitCounter() {
        this.actualHitCounter = this.hitCounter; // Resetuj licznik trafień
        this.cooldown = false; // Wyłącz chłodzenie
    }
}

const wallModels = {
    "tree": {
        name: "tree",
        image: treeImage,
        interaction: function() { 
            if (g1.hand) {
                if (g1.hand.name != 'axe') {
                    g1.addItemToEQ("aCorn",2)
                    this.actualHitCounter--
                } else {
                    this.hp--
                }
            } else {
                g1.addItemToEQ("aCorn",2)
                this.actualHitCounter--
            }
        },
        isPassable: false,
        framesPerRow: 2,
        frameInterval: 16,
        hitLimit: 3,
        cooldown: 500,
        onDestroy: function() {
            if (g1.canFitInEQ("wood", 3)) {
                g1.addItemToEQ("wood", 3);
            } else {

            }
        },
        onUpdate: null,
    },
    "bush": {
        name: "bush",
        image: bushImage,
        interaction: function() { 
            g1.addItemToEQ("stick",2) 
            this.actualHitCounter--
        },
        isPassable: true,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        onDestroy: null,
        onUpdate: null,
    },
    "boulder": {
        name: "boulder",
        image: boulderImage,
        interaction: function() { 
            if (g1.hand) {
                if (g1.hand.name == 'pickaxe') {
                    this.hp--
                }
            }
        },
        isPassable: false,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        hp: 3,
        maxHp: 3,
        onDestroy: function() {
            if (g1.canFitInEQ("rock", 3)) {
                g1.addItemToEQ("rock", 3);
            } else {

            }
        },
        onUpdate: null,
    },
    "firePit": {
        name: "firePit",
        image: firePitImage,
        interaction: function() {
            if (g1.hand && g1.hand.name == "stick") {
                g1.deleteFromHand(1)
                this.hp += 5
            }
        },
        isPassable: false,
        framesPerRow: 2,
        frameInterval: 32,
        hitLimit: 1,
        cooldown: 500,
        hp: 20,
        maxHp: 20,
        onDestroy: null,
        onUpdate: function(frameCounter) {
            if (frameCounter % 60 == 0) {
                if (this.hp == 0) {
                    this.destroy();
                }
                this.hp--
                console.log(this.hp)
            }
        },
    },
    //Przedmioty na ziemi
    "aCorn": {
        name: "aCorn",
        image: aCornImage,
        interaction: function() { 
            if (g1.canFitInEQ("aCorn", 1)) {
                g1.addItemToEQ("aCorn", 1);
                this.hp--
            }
        },
        isPassable: true,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        hp: 1,
        maxHp: 1,
        onDestroy: null,
        onUpdate: null,
    },
    "stick": {
        name: "stick",
        image: stickImage,
        interaction: function() { 
            if (g1.canFitInEQ("stick", 1)) {
                g1.addItemToEQ("stick", 1);
                this.hp--
            }
        },
        isPassable: true,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        hp: 1,
        maxHp: 1,
        onDestroy: null,
        onUpdate: null,
    },
    "rock": {
        name: "rock",
        image: rockImage,
        interaction: function() { 
            if (g1.canFitInEQ("rock", 1)) {
                g1.addItemToEQ("rock", 1);
                this.hp--
            }
        },
        isPassable: true,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        hp: 1,
        maxHp: 1,
        onDestroy: null,
        onUpdate: null,
    },
    "wood": {
        name: "wood",
        image: woodImage,
        interaction: function() { 
            if (g1.canFitInEQ("wood", 1)) {
                g1.addItemToEQ("wood", 1);
                this.hp--
            }
        },
        isPassable: true,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        hp: 1,
        maxHp: 1,
        onDestroy: null,
        onUpdate: null,
    },
    "axe": {
        name: "axe",
        image: axeImage,
        interaction: function() { 
            if (g1.canFitInEQ("axe", 1)) {
                g1.addItemToEQ("axe", 1);
                this.hp--
            }
        },
        isPassable: true,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        hp: 1,
        maxHp: 1,
        onDestroy: null,
        onUpdate: null,
    },
    "pickaxe": {
        name: "pickaxe",
        image: pickaxeImage,
        interaction: function() { 
            if (g1.canFitInEQ("pickaxe", 1)) {
                g1.addItemToEQ("pickaxe", 1);
                this.hp--
            }
        },
        isPassable: true,
        framesPerRow: 1,
        frameInterval: 16,
        hitLimit: 1,
        cooldown: 500,
        hp: 1,
        maxHp: 1,
        onDestroy: null,
        onUpdate: null,
    },
};
const plainsModels = {
    tree: { ...wallModels.tree },
    bush: { ...wallModels.bush },
    boulder: { ...wallModels.boulder },
    rock: {...wallModels.rock },
};
// Funkcja sprawdzająca kolizję uwzględniająca przechodzenie przez obiekty
function checkCollision(newX, newY) {
    const collidedObject = mapa.find(thing =>
        thing instanceof Ściana &&
        thing.x === newX &&
        thing.y === newY
    );

    if (collidedObject && !collidedObject.isPassable) {
        return collidedObject; // Jeśli obiekt jest nieprzekraczalny, zwróć go jako kolizję
    }

    return null; // Jeśli brak kolizji lub obiekt jest przekraczalny, zwróć null
}


class Item {
    constructor(image, quantity = 1, maxStack = 64, name = '', useable = 'none', onPlace = function() {console.log("Nie ma takiej funkcji")}) {
        this.image = image;
        this.quantity = quantity;
        this.maxStack = maxStack;
        this.name = name; 
        this.useable = useable
        this.onPlace = onPlace
    }

    addToStack(amount) {
        const spaceLeft = this.maxStack - this.quantity;
        if (amount <= spaceLeft) {
            this.quantity += amount;
            return 0;
        } else {
            this.quantity = this.maxStack;
            return amount - spaceLeft;
        }
    }

    isSameAs(other) {
        if (other) {
            return this.name === other.name;
        } else {
            return false
        }
         
    }
    onHit() {
        console.log(this)
        if (g1.canFitInEQ(this.name, this.quantity)) {
            g1.addItemToEQ(this.name, this.quantity)
            const index = mapa.findIndex(item => item.x === this.x && item.y === this.y);

            mapa.splice(index, 1);
            console.log("Obiekt usunięty z tablicy `mapa`:", this);
        }
    }

    draw(ctx, offsetX, offsetY) {

        ctx.drawImage(
            this.image,
            (this.x - offsetX) * cellWidth, (this.y - offsetY) * cellWidth, cellWidth, cellWidth
        );
    }
    
    drawInEQ(ctx, x, y) {
        ctx.drawImage(this.image, 0, 0, cellWidth / 3, cellWidth / 3, x, y, cellWidth, cellWidth);
        if (this.quantity > 1) {
            this.drawNumber(ctx, this.quantity, x, y);
        }
    }

    drawNumber(ctx, number, x, y) {
        const numberStr = number.toString();
        const digitWidth = 5;
        const digitHeight = 7;
        const scaleFactor = 3;

        for (let i = 0; i < numberStr.length; i++) {
            const digit = parseInt(numberStr[numberStr.length-(i+1)]);

            ctx.drawImage(
                numbersImage,
                digit * digitWidth, 0,
                digitWidth, digitHeight,
                x - (i + 1) * digitWidth * scaleFactor + cellWidth,
                y - digitHeight * scaleFactor + cellWidth,
                digitWidth * scaleFactor, digitHeight * scaleFactor
            );
        }
    }
    use(slotIndex) {
        console.log(this)
        switch (this.useable) {
            case "hand":
                g1.equipHand(this, slotIndex);
                break;
            case "body":
                g1.equipBody(this, slotIndex);
                break;
            case "head":
                g1.equipHead(this, slotIndex);
                break;
            case "placeable":
                selectedItemIndex = slotIndex
                this.onPlace();
                selectedItem = null
                break;
            default:
                console.log("ConfuzedAnimeCharacter.png");
                break;
        }
    }
    dropItem(slotIndex) {
        console.log(wallModels[this.name])
        const thisWallModel = wallModels[this.name]
        const objectOnTile = mapa.find(object => object.x === g1.x && object.y === g1.y);
        if (!objectOnTile) {
            const newObject = new Ściana (
                g1.x,
                g1.y,
                thisWallModel.name,
                thisWallModel.image,
                thisWallModel.interaction,
                thisWallModel.isPassable,
                thisWallModel.framesPerRow,
                thisWallModel.frameInterval,
                thisWallModel.hitLimit,
                thisWallModel.cooldown,
                this.quantity,
                this.quantity,
                thisWallModel.onDestroy,
                thisWallModel.onUpdate,
            )
            g1.deleteFromInventory(slotIndex)
            mapa.push(newObject)
        } else if (objectOnTile.type == g1.eq[slotIndex].type) {
            objectOnTile.hp += this.quantity;
            objectOnTile.maxHp += this.quantity;

            g1.deleteFromInventory(slotIndex);
        }
    }
}

const items = {
    aCorn: new Item(aCornImage, 0, 40, 'aCorn', 'placeable', () => {
        const exists = mapa.some(item => item.x === g1.x && item.y === g1.y);
        console.log("Exists", exists)
        if (!exists) {
        mapa.push(new Ściana(
            g1.x,
            g1.y,
            wallModels.tree.name,
            wallModels.tree.image,
            wallModels.tree.interaction,
            wallModels.tree.isPassable,
            wallModels.tree.framesPerRow,
            wallModels.tree.frameInterval,
            wallModels.tree.hitLimit,
            wallModels.tree.cooldown,
            wallModels.tree.hp,
            wallModels.tree.maxHp,
            wallModels.tree.onDestroy,
            wallModels.tree.onUpdate,
        ));
        g1.deleteFromInventory(selectedItemIndex,1)
        } else {
            console.log("nie")
        }
    }),
    stick: new Item(stickImage, 0, 40, 'stick', 'hand', undefined),
    rock: new Item(rockImage, 0, 40, 'rock', 'none', undefined),
    wood: new Item(woodImage, 0, 40, 'wood', 'none', undefined),
    axe: new Item(axeImage, 0, 1, 'axe', 'hand', undefined), 
    pickaxe: new Item(pickaxeImage, 0, 1, 'pickaxe', 'hand', undefined), 
};
let selectedCraft = -1
const crafts = {
    "axe": {
        image: axeImage,
        recipe: {
            stick: 1, 
            rock: 1
        },
        type: "item"
    },
    "pickaxe": {
        image: pickaxeImage,
        recipe: {
            stick: 1, 
            rock: 2
        },
        type: "item"
    },
    "firePit": {
        image: firePitImage,
        recipe: {
            wood: 2,
            stick: 2
        },
        type: "wall"
    }
}
const craftsList = Object.values(crafts);

let g1 = new Gracz(Math.floor(mapWidth / 2), Math.floor(mapHeight / 2), playerImage);
let ściany = [];

for (let i = 0; i < mapWidth; i++) {
    for (let j = 0; j < mapHeight; j++) {
        if (Math.random() < 0.1) {
            const plainsKeys = Object.keys(plainsModels);
            const randomKey = plainsKeys[Math.floor(Math.random() * plainsKeys.length)];
            const randomWallModel = plainsModels[randomKey];

            ściany.push(new Ściana(
                i,
                j,
                randomWallModel.name,
                randomWallModel.image,
                randomWallModel.interaction, 
                randomWallModel.isPassable, 
                randomWallModel.framesPerRow, 
                randomWallModel.frameInterval,
                randomWallModel.hitLimit,
                randomWallModel.cooldown,
                randomWallModel.hp,
                randomWallModel.maxHp,
                randomWallModel.onDestroy,
                randomWallModel.onUpdate,
            ));    
        } 
    }
}

let mapa = [...ściany];
const keysPressed = new Map();

let offsetX = 0;
let offsetY = 0;



function checkCollision(newX, newY) {
    return mapa.find(thing => 
        (thing instanceof Ściana || thing instanceof Item) && 
        thing.x === newX && 
        thing.y === newY
    );
}

function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    g1.draw(ctx, offsetX, offsetY)
    mapa.forEach(thing => {
        thing.draw(ctx, offsetX, offsetY);
    });

    drawLight();
    
    drawEQ();
    drawCrafting();
    drawStats();
}

function drawLight() {
    if (g1.light === 0) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const lightRatio = g1.light / g1.maxLight;
    const centerX = (g1.x - offsetX) * cellWidth + cellWidth / 2;
    const centerY = (g1.y - offsetY) * cellWidth + cellWidth / 2;
    const radius = cellWidth * 18 * lightRatio;

    // Rozmiar pikseli
    const pixelSize = 16; // Im większy, tym bardziej pikselizowany efekt

    // Tworzymy offscreen canvas, na którym narysujemy pikselizowany gradient
    const offscreenCanvas = document.createElement('canvas');
    const offscreenCtx = offscreenCanvas.getContext('2d');

    // Rozmiar offscreen canvas jest mniejszy w zależności od pixelSize
    offscreenCanvas.width = canvas.width / pixelSize;
    offscreenCanvas.height = canvas.height / pixelSize;

    // Tworzymy gradient na offscreen canvas
    const gradient = offscreenCtx.createRadialGradient(centerX / pixelSize, centerY / pixelSize, 0, centerX / pixelSize, centerY / pixelSize, radius / pixelSize);

    // Ustawienie kolorów gradientu
    const maxTransparency = 0.1 + (1 - lightRatio) * 0.1; // Mniej przezroczysty środek
    const midTransparency = 0.2 + (1 - lightRatio) * 0.2; // Średni cień, również jaśniejszy
    const edgeTransparency = 0.4 + (1 - lightRatio) * 0.4; // Jaśniejsze krawędzie

    gradient.addColorStop(0, `rgba(0, 0, 0, ${maxTransparency})`);                       // Jaśniejszy środek
    gradient.addColorStop(0.3 * lightRatio, `rgba(0, 0, 0, ${midTransparency})`); // Mniej ciemny środek
    gradient.addColorStop(0.7 * lightRatio, `rgba(0, 0, 0, ${edgeTransparency})`); // Jaśniejsze obrzeża
    gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');                        // Czerń na najdalszych obrzeżach

    // Rysujemy gradient na offscreen canvas
    offscreenCtx.fillStyle = gradient;
    offscreenCtx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    // Wyłączamy wygładzanie, aby uzyskać efekt pikselizacji
    ctx.imageSmoothingEnabled = false;

    // Rysujemy pikselizowany gradient z offscreen canvas na głównym canvasie
    ctx.drawImage(offscreenCanvas, 0, 0, canvas.width, canvas.height);
}




function drawGrid() {
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += cellWidth) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += cellWidth) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawEQ() {
    ctx.fillStyle = "gray";
    ctx.fillRect(cellWidth * 3 / 2, canvas.height - cellWidth * 3 / 2, canvas.width - cellWidth * 3, cellWidth);

    if (g1.hand) {
        g1.hand.drawInEQ(ctx, cellWidth * 18 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth,);
    } else {
        ctx.drawImage(
            eqHandImage,cellWidth * 18 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    }
    if (g1.body) {
        g1.body.drawInEQ(ctx, cellWidth * 19 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth,);
    } else {
        ctx.drawImage(
            eqBodyImage,cellWidth * 19 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    }
    if (g1.head) {
        g1.head.drawInEQ(ctx, cellWidth * 20 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth,);
    } else {
        ctx.drawImage(
            eqHeadImage,cellWidth * 20 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    }
    
    
   
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    
    g1.eq.forEach((item, index) => {
        if (item) {
            const slotX = cellWidth * 3 / 2 + index * cellWidth;
            const slotY = canvas.height - cellWidth * 3 / 2;
            item.drawInEQ(ctx, slotX, slotY);
        }
    });

    if (g1.hand) {
        g1.hand.drawInEQ(ctx, cellWidth * 18 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth,);
    }

    ctx.fillStyle = 'black';        // Kolor wypełnienia
    ctx.fillRect(cellWidth * 17 + cellWidth / 2, canvas.height - cellWidth * 3 / 2, cellWidth, cellWidth);
    for (let i = 0; i <= 20; i++) {
        let x = cellWidth * 3 / 2 + (i * cellWidth);
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - cellWidth * 3 / 2);
        ctx.lineTo(x, canvas.height - cellWidth/2);
        ctx.stroke();
    }
    for (let i = 0; i < 2; i++) {
        const y = canvas.height - cellWidth * 3 / 2 + cellWidth * i;
        ctx.beginPath();
        ctx.moveTo(cellWidth * 3 / 2, y);
        ctx.lineTo(canvas.width - cellWidth * 3/2, y);
        ctx.stroke();
    }
}

function drawCrafting() {
    if (!button) {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, cellWidth * 5 / 2, cellWidth, cellWidth);
        ctx.drawImage(
            craftingImage, 0, 0, cellWidth / 3, cellWidth / 3, 0, cellWidth * 5 / 2, cellWidth, cellWidth,
        );
        ctx.strokeRect(0, cellWidth * 5 / 2, cellWidth, cellWidth);
    } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(cellWidth * 6, cellWidth*5/2, cellWidth, cellWidth);
        ctx.drawImage(
            craftingImage, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 6, cellWidth * 5 / 2, cellWidth, cellWidth,
        );
        ctx.strokeRect(cellWidth * 6, cellWidth * 5 / 2, cellWidth, cellWidth);

        ctx.fillRect(0, cellWidth * 5 / 2 , cellWidth * 6, cellWidth * 8);
        
        for(let i = 0; i < craftsList.length; i++) {
            ctx.drawImage(
                craftsList[i].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * i, cellWidth * 5 / 2, cellWidth, cellWidth,
            );
        }
        for(let i = 0; i < craftsList.length; i++) {
            ctx.strokeRect(cellWidth * i, cellWidth * 5 / 2, cellWidth, cellWidth);
        }
        if (selectedCraft >= 0) {
            console.log(selectedCraft)
            ctx.drawImage(
                craftsList[selectedCraft].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 9 / 2, cellWidth * 9, cellWidth, cellWidth,
            );
            ctx.drawImage(
                arrowRightImage, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 3, cellWidth * 9, cellWidth, cellWidth,
            );
            const recipe = craftsList[selectedCraft].recipe;
            const ingredientCount = Object.keys(recipe).length;
            switch (ingredientCount) {
                case 1:
                    for (let ingredient in recipe) {
                        
                        ctx.drawImage(
                            items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 3 / 2, cellWidth * 9, cellWidth, cellWidth,
                        );
                        if (recipe[ingredient] > 1) {
                            items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 3 / 2, cellWidth * 9);
                        }
                        ctx.strokeRect(cellWidth * 3 / 2, cellWidth * 9, cellWidth, cellWidth);  
                    }
                    break;
                case 2:
                    var i = 0
                    for (let ingredient in recipe) {
                        ctx.drawImage(
                            items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 1 / 2 + cellWidth * i, cellWidth * 9, cellWidth, cellWidth,
                        );
                        if (recipe[ingredient] > 1) {
                            items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 1 / 2 + cellWidth * i, cellWidth * 9);
                        }
                        ctx.strokeRect(cellWidth * 1 / 2 + cellWidth * i, cellWidth * 9, cellWidth, cellWidth);
                        i++  
                    }
                    break;
                case 3:
                    var i = 0
                    for (let ingredient in recipe) {
                        switch (i){
                            case 0:
                                ctx.drawImage(
                                    items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 1 / 2, cellWidth * 17 / 2, cellWidth, cellWidth,
                                );
                                if (recipe[ingredient] > 1) {
                                    items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 1 / 2, cellWidth * 17 / 2);
                                }
                                ctx.strokeRect(cellWidth * 1 / 2, cellWidth * 17 / 2, cellWidth, cellWidth);
                                break;
                            case 1:
                                ctx.drawImage(
                                    items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth, cellWidth * 19 / 2, cellWidth, cellWidth,
                                );
                                if (recipe[ingredient] > 1) {
                                    items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth, cellWidth * 19 / 2);
                                }
                                ctx.strokeRect(cellWidth, cellWidth * 19 / 2, cellWidth, cellWidth);
                                break;
                            case 2:
                                ctx.drawImage(
                                    items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 3 / 2, cellWidth * 17 / 2, cellWidth, cellWidth,
                                );
                                if (recipe[ingredient] > 1) {
                                    items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 3 / 2, cellWidth * 17 / 2);
                                }
                                ctx.strokeRect(cellWidth * 3 / 2, cellWidth * 17 / 2, cellWidth, cellWidth);
                                break;
                        }
                        i++  
                    }
                    break;
                case 4:
                    var i = 0
                    for (let ingredient in recipe) {
                        switch (i){
                            case 0:
                                ctx.drawImage(
                                    items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 1 / 2, cellWidth * 17 / 2, cellWidth, cellWidth,
                                );
                                
                                if (recipe[ingredient] > 1) {
                                    items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 1 / 2, cellWidth * 17 / 2);
                                }
                                ctx.strokeRect(cellWidth * 1 / 2, cellWidth * 17 / 2, cellWidth, cellWidth);
                                break;
                            case 1:
                                ctx.drawImage(
                                    items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 1 / 2, cellWidth * 19 / 2, cellWidth, cellWidth,
                                );
                                ctx.strokeRect(cellWidth * 1 / 2, cellWidth * 19 / 2, cellWidth, cellWidth);
                                if (recipe[ingredient] > 1) {
                                    items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 1 / 2, cellWidth * 19 / 2);
                                }
                                break;
                            case 2:
                                ctx.drawImage(
                                    items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 3 / 2, cellWidth * 17 / 2, cellWidth, cellWidth,
                                );
                                ctx.strokeRect(cellWidth * 3 / 2, cellWidth * 17 / 2, cellWidth, cellWidth);
                                if (recipe[ingredient] > 1) {
                                    items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 3 / 2, cellWidth * 17 / 2);
                                }
                                break;
                            case 3:
                                ctx.drawImage(
                                    items[ingredient].image, 0, 0, cellWidth/3, cellWidth / 3, cellWidth * 1 / 2 + cellWidth, cellWidth * 19 / 2, cellWidth, cellWidth,
                                );
                                if (recipe[ingredient] > 1) {
                                    items[ingredient].drawNumber(ctx, recipe[ingredient], cellWidth * 3 / 2, cellWidth * 19 / 2);
                                }
                                ctx.strokeRect(cellWidth * 1 / 2 + cellWidth, cellWidth * 19 / 2, cellWidth, cellWidth);
                                break;
                        }
                        i++  
                    }
                    break;
            }
            ctx.strokeRect(0, cellWidth * 17 / 2, cellWidth * 6, cellWidth * 2);    
            ctx.strokeRect(cellWidth * 9 / 2, cellWidth * 9, cellWidth, cellWidth);  
        }
        ctx.strokeRect(0, cellWidth * 5 / 2, cellWidth * 6, cellWidth * 8);
        
        
    }
    
}

function drawStats() {
    ctx.fillStyle = "gray";
    ctx.fillRect(canvas.width - cellWidth * 5 / 2, cellWidth * 3 / 2, cellWidth, cellWidth);
    if (g1.hunger >= g1.maxHunger * 0.9) {  
        ctx.drawImage(
            foodImage, 0, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 5 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else if (g1.hunger >= g1.maxHunger * 0.72) {
        ctx.drawImage(
            foodImage, foodImage.width / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 5 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else  if (g1.hunger >= g1.maxHunger * 0.36){
        ctx.drawImage(
            foodImage, foodImage.width * 2 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 5 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else  if (g1.hunger >= g1.maxHunger * 0.10){
        ctx.drawImage(
            foodImage, foodImage.width * 3 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 5 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else  {
        ctx.drawImage(
            foodImage, foodImage.width * 4 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 5 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    }
    ctx.strokeRect(canvas.width - cellWidth * 5 / 2, cellWidth * 3 / 2, cellWidth, cellWidth);

    ctx.fillRect(canvas.width - cellWidth * 8 / 2, cellWidth * 3 / 2, cellWidth, cellWidth);
    if (g1.hp >= g1.maxHp * 0.9) {  
        ctx.drawImage(
            hearthImage, 0, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 8 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else if (g1.hp >= g1.maxHp * 0.72) {
        ctx.drawImage(
            hearthImage, hearthImage.width / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 8 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else if (g1.hp >= g1.maxHp * 0.36){
        ctx.drawImage(
            hearthImage, hearthImage.width * 2 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 8 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else if (g1.hp >= g1.maxHp * 0.10){
        ctx.drawImage(
            hearthImage, hearthImage.width * 3 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 8 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    } else {
        ctx.drawImage(
            hearthImage, hearthImage.width * 4 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 8 / 2, cellWidth * 3 / 2, cellWidth, cellWidth,
        );
    }
    ctx.strokeRect(canvas.width - cellWidth * 8 / 2, cellWidth * 3 / 2, cellWidth, cellWidth);

    ctx.fillRect(canvas.width - cellWidth * 13 / 4, cellWidth * 6 / 2, cellWidth, cellWidth);
    if (g1.light >= g1.maxLight * 0.9) {  
        ctx.drawImage(
            lightImage, 0, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 13 / 4, cellWidth * 6 / 2, cellWidth, cellWidth,
        );
    } else if (g1.light >= g1.maxLight * 0.72) {
        ctx.drawImage(
            lightImage, lightImage.width / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 13 / 4, cellWidth * 6 / 2, cellWidth, cellWidth,
        );
    } else if (g1.light >= g1.maxLight * 0.36){
        ctx.drawImage(
            lightImage, lightImage.width * 2 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 13 / 4, cellWidth * 6 / 2, cellWidth, cellWidth,
        );
    } else if (g1.light >= g1.maxLight * 0.10){
        ctx.drawImage(
            lightImage, lightImage.width * 3 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 13 / 4, cellWidth * 6 / 2, cellWidth, cellWidth,
        );
    } else {
        ctx.drawImage(
            lightImage, lightImage.width * 4 / 5, 0, cellWidth / 3, cellWidth / 3, canvas.width - cellWidth * 13 / 4, cellWidth * 6 / 2, cellWidth, cellWidth,
        );
    }
    ctx.strokeRect(canvas.width - cellWidth * 13 / 4, cellWidth * 6 / 2, cellWidth, cellWidth);
}

function movePlayer(direction) {
    let newX = g1.x;
    let newY = g1.y;
    switch (direction) {
        case 'ArrowUp': 
            newY--; 
            break;
        case 'ArrowDown': 
            newY++; 
            break;
        case 'ArrowLeft': 
            newX--; 
            break;
        case 'ArrowRight': 
            newX++; 
            break;
        case ' ': 
            if (checkCollision(g1.x, g1.y)) {
                console.log("Hm")
                checkCollision(g1.x, g1.y).onHit();
            }
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            if (g1.eq[direction-1]) {
                g1.eq[direction-1].use(direction-1)
            }
            break;
        case '0':
            g1.eq[9].use(9)
            break;
        case '!':
            g1.eq[0].dropItem(0)
            break;
        case '@':
            g1.eq[1].dropItem(1)
            break;
        case '#':
            g1.eq[2].dropItem(2)
            break;
        case '$':
            g1.eq[3].dropItem(3)
            break;
        case '%':
            g1.eq[4].dropItem(4)
            break;
        case '^':
            g1.eq[5].dropItem(5)
            break;
        case '&':
            g1.eq[6].dropItem(6)
            break;
        case '*':
            g1.eq[7].dropItem(7)
            break;
        case '(':
            g1.eq[8].dropItem(8)
            break;
        case ')':
            g1.eq[9].dropItem(9)
            break;
        case 'Control':
            button = !button
            break;
        case 'Enter':
            if (button) {
                console.log("Craftowańsko")
                if (selectedCraft != -1) {
                    const craftNames = Object.keys(crafts);
                    let selectedCraftName = craftNames[selectedCraft];
                    g1.craft(selectedCraftName)
                }
            }
            break;
        default:
            console.log(direction)
            break;
    }

    if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) return;

    const collidedObject = checkCollision(newX, newY);
    if (!collidedObject || (collidedObject.isPassable || collidedObject instanceof Item)) {
        g1.x = newX;
        g1.y = newY;
        updateOffsets();
    } else if (collidedObject && (g1.x != newX || g1.y != newY)) {
        collidedObject.onHit();
    }
}


function updateOffsets() {
    offsetX = Math.max(0, Math.min(g1.x - Math.floor(viewWidth / 2), mapWidth - viewWidth));
    offsetY = Math.max(0, Math.min(g1.y - Math.floor(viewHeight / 2), mapHeight - viewHeight));
}

function handleKeyDown(event) {
    if (!keysPressed.has(event.key)) {
        movePlayer(event.key);
        const intervalId = setInterval(() => movePlayer(event.key), 200);
        keysPressed.set(event.key, intervalId);
    }
}

function handleKeyUp(event) {
    if (keysPressed.has(event.key)) {
        clearInterval(keysPressed.get(event.key));
        keysPressed.delete(event.key);
    }
}



function handleMouseClick(event) {
    // Pobierz współrzędne kliknięcia w odniesieniu do canvasu
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const menuX = cellWidth * 3 / 2;
    const menuWidth = canvas.width - cellWidth * 3;
    const menuY = canvas.height - cellWidth * 3 / 2;
    const menuHeight = cellWidth;
    const eqSlotWidth = cellWidth;
    const eqSlotStartX = cellWidth * 3 / 2;
    const eqSlotCount = 16;

    if (!button) {
        if (clickX >= 0 && clickX <= cellWidth && clickY >= cellWidth * 5 / 2 && clickY <= cellWidth * 7 / 2) {
            button = !button;
            return;
        }
    } else {
        if (clickX >= cellWidth * 6 && clickX <= cellWidth * 7 && clickY >= cellWidth * 5 / 2 && clickY <= cellWidth * 7 / 2) {
            button = !button;
            return;
        } else if (clickX >= 0 && clickX <= cellWidth * 6 && clickY >= cellWidth * 5 / 2 && clickY <= cellWidth * 17 / 2) {
            let i = 0;
            for (let y = 0; y < 6; y++) {
                for (let x = 0; x < 6; x++) {
                    if (i == craftsList.length) {
                        return;
                    }
                    if (clickX >= cellWidth * x && clickX <= cellWidth * (x + 1) && clickY >= (cellWidth * 5 / 2) + cellWidth * y && clickY <= (cellWidth * 7 / 2) + cellWidth * y) {
                        selectedCraft = x + 6 * y;
                        return;
                    }
                    i++;
                }
            }
            return;
        } else if (clickX >= 0 && clickX <= cellWidth * 6 && clickY >= cellWidth * 17 / 2 && clickY <= cellWidth * 21 / 2) {
            console.log("Craftowańsko")
            if (selectedCraft != -1) {
                const craftNames = Object.keys(crafts);
                let selectedCraftName = craftNames[selectedCraft];
                g1.craft(selectedCraftName)
            }
            return
        }
    }

    // Sprawdzenie, czy kliknięto w menu (ekwipunek)
    
    if (clickX >= menuX && clickX <= menuX + menuWidth && clickY >= menuY && clickY <= menuY + menuHeight) {
        const slotIndex = Math.floor((clickX - eqSlotStartX) / eqSlotWidth);
        if (event.button == 0) {
            if (slotIndex >= 0 && slotIndex < eqSlotCount) {
                const clickedItem = g1.eq[slotIndex];
                if (clickedItem) {
                    clickedItem.use(slotIndex)
                } else {
                    console.log("Pusty slot ekwipunku");
                }
            } else if (slotIndex == 17) {
                g1.unequipHand();
            } else if (slotIndex == 18) {
                g1.unequipBody();
            } else if (slotIndex == 19) {
                g1.unequipHead();
            }
            return; // Zakończ funkcję, aby uniknąć dalszego przetwarzania dla mapy
        } else if (event.button == 2) {
            if (slotIndex >= 0 && slotIndex < eqSlotCount) {
                const clickedItem = g1.eq[slotIndex];
                if (clickedItem) {
                    clickedItem.dropItem(slotIndex);
                } else {
                    console.log("Zajęte pole, nie zrzucisz")
                }
            }
            return
        }
    }

    // Przelicz na współrzędne siatki (jeśli kliknięcie nie jest w menu)
    const gridX = Math.floor(clickX / cellWidth) + offsetX;
    const gridY = Math.floor(clickY / cellWidth) + offsetY;

    console.log(`Kliknięto na współrzędne siatki: (${gridX}, ${gridY})`);

    // Jeśli aktywne podświetlenie
    
    // Sprawdź, czy kliknięto na obiekt w tych współrzędnych
    const clickedObject = mapa.find(thing => thing.x === gridX && thing.y === gridY);
    if (clickedObject) {
        console.log("Kliknięto na obiekt:", clickedObject);
    } else {
        console.log("Kliknięto na pustą przestrzeń.");
    }
}




function initializeCanvas() {
    let imagesLoaded = 0;
    const totalImages = 7;

    function imageLoaded() {
        imagesLoaded += 1;
        if (imagesLoaded === totalImages) {
            updateOffsets();
            drawMap();
            gameLoop(); // Rozpoczęcie pętli gry
        }
    }

    arrowRightImage.onload = imageLoaded
    craftingImage.onload = imageLoaded
    eqHandImage.onload = imageLoaded;
    eqBodyImage.onload = imageLoaded;
    eqHeadImage.onload = imageLoaded;
    foodImage.onload = imageLoaded;
    hearthImage.onload = imageLoaded;
    numbersImage.onload = imageLoaded;
    lightImage.onload = imageLoaded;

    aCornImage.onload = imageLoaded;
    axeImage.onload = imageLoaded;
    pickaxeImage.onload = imageLoaded;
    rockImage.onload = imageLoaded;
    stickImage.onload = imageLoaded;
    woodImage.onload = imageLoaded;

    boulderImage.onload = imageLoaded;
    bushImage.onload = imageLoaded;
    firePitImage.onload = imageLoaded;
    treeImage.onload = imageLoaded;

    playerImage.onload = imageLoaded;

}
function isVisible(thing, buffer = 2) {
    // Oblicz obszar widoczny z uwzględnieniem offsetu i dodatkowego marginesu
    const startX = offsetX - buffer;
    const endX = offsetX + viewWidth + buffer;
    const startY = offsetY - buffer;
    const endY = offsetY + viewHeight + buffer;

    return thing.x >= startX && thing.x <= endX && thing.y >= startY && thing.y <= endY;
}

function gameLoop() {
    frameCounter++;

    mapa.forEach(thing => {
        if (thing.updateAnimation && isVisible(thing, 2)) {
            thing.updateAnimation(frameCounter);
        }
    });

    mapa.forEach(thing => {
        if (thing.onUpdate && isVisible(thing, 20)) {
            thing.onUpdate(frameCounter);
        }
    });


    g1.updateAnimation(frameCounter);
    drawMap();

    if (frameCounter >= 240) {
        frameCounter = 0;
    }

    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('mousedown', handleMouseClick);
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

initializeCanvas();
