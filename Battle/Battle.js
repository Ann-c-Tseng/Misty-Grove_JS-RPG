class Battle {
    constructor({enemy, onComplete}) {
        this.enemy = enemy;
        this.onComplete = onComplete;

        this.combatants = {
        }

        this.activeCombatants = {
            player: null,
            enemy: null,
        }

        //Dynamically add player team
        window.playerState.lineup.forEach(id => {
            this.addCombatant(id, "player", window.playerState.mushrooms[id])
        });
        //Dynamically add enemy team
        Object.keys(this.enemy.mushrooms).forEach(key => {
            this.addCombatant("e_"+key, "enemy", this.enemy.mushrooms[key])
        });

        //Start items as empty
        this.items = []

        //Add in player items
        window.playerState.items.forEach(item => {
            this.items.push({
                ...item,
                team: "player"
            })
        })
        this.usedInstanceIds = {};
    }

    addCombatant(id, team, config) {
        this.combatants[id] = new Combatant({
            ...Mushroom[config.mushroomId], //e.g. ...Mushroom.p001,
            ...config, //grabs info about current hp, xp, status etc...
            team,
            isPlayerControlled: team === "player"
        }, this)

        //Populate first active mushroom
        this.activeCombatants[team] = this.activeCombatants[team] || id
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Battle");
        this.element.innerHTML = (`
            <div class="Battle_hero">
                <img src="${'./images/characters/people/hero.png'}" alt="Hero" />
            </div>
            <div class="Battle_enemy">
                <img src="${this.enemy.src}" alt=${this.enemy.name} />
            </div>
        `)
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);

        this.playerTeam = new Team("player", "Hero");
        this.enemyTeam = new Team("enemy", "Bully");

        Object.keys(this.combatants).forEach(key => {
            let combatant = this.combatants[key];
            combatant.id = key;
            combatant.init(this.element);

            //Add to correct team
            if(combatant.team == "player") {
                this.playerTeam.combatants.push(combatant);
            } else if (combatant.team == "enemy") {
                this.enemyTeam.combatants.push(combatant);
            }
        })

        this.playerTeam.init(this.element);
        this.enemyTeam.init(this.element);

        this.turnCycle = new TurnCycle({
            battle: this,
            onNewEvent: event => {
                return new Promise(resolve => {
                    const battleEvent = new BattleEvent(event, this);
                    battleEvent.init(resolve);
                })
            },
            onWinner: winner => {
                if(winner === "player") {
                    const playerState = window.playerState;
                    Object.keys(playerState.mushrooms).forEach(id => {
                        const playerStateMushroom = playerState.mushrooms[id];
                        const combatant = this.combatants[id];
                        if(combatant) {
                            playerStateMushroom.hp = combatant.hp;
                            playerStateMushroom.xp = combatant.xp;
                            playerStateMushroom.maxXp = combatant.maxXp;
                            playerStateMushroom.level = combatant.level;
                        }
                    })

                    //Delete player used items
                    playerState.items = playerState.items.filter(item => {
                        return !this.usedInstanceIds[item.instanceId]
                    })
                }

                this.element.remove(); //remove turn cycle and end battle!
                this.onComplete();
            }
        })
        this.turnCycle.init();
    }
}