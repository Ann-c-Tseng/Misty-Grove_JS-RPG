class TurnCycle {
    constructor({battle, onNewEvent, onWinner}) {
        this.battle = battle;
        this.onNewEvent = onNewEvent;
        this.onWinner = onWinner;
        this.currentTeam = "player"; //or "enemy"
     }

    async turn() {
        //Get the current caster and their "opponent"
        const casterId = this.battle.activeCombatants[this.currentTeam];
        const caster = this.battle.combatants[casterId];
        const enemyId = this.battle.activeCombatants[caster.team === "player" ? "enemy" : "player"];
        const enemy = this.battle.combatants[enemyId];

        const submission = await this.onNewEvent({
            type: "submissionMenu",
            caster,
            enemy
        });

        //Stop here if we are replacing mushroom with another
        if(submission.replacement) {
            await this.onNewEvent({
                type: "replace",
                replacement: submission.replacement
            })
            await this.onNewEvent({
                type: "textMessage",
                text: `${submission.replacement.name} is now on field!`
            })
            this.nextTurn();
            return;
        }

        //Filter battle items to make sure that item doesn't match instanceId used.
        if(submission.instanceId) {
            //Add to list to persist to player state later
            this.battle.usedInstanceIds[submission.instanceId] = true;

            //Remove item from battle state
            this.battle.items = this.battle.items.filter(i => i.instanceId !== submission.instanceId);
        }

        const resultingEvents = caster.getReplacedEvents(submission.action.success);

        for(let i = 0; i < resultingEvents.length; i++) {
            const event = {
                ...resultingEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Did the target die?
        const targetDead = submission.target.hp <= 0;
        if (targetDead) {
            await this.onNewEvent({
                type: "textMessage", text: `${submission.target.name} is down!`
            })

            if(submission.target.team === "enemy") {
                
                const playerActiveMushroomId = this.battle.activeCombatants.player;
                const xp = submission.target.givesXp;
                await this.onNewEvent({
                    type: "textMessage",
                    text: `Gained ${xp} XP!`
                })
                await this.onNewEvent({
                    type: "giveXp",
                    xp,
                    combatant: this.battle.combatants[playerActiveMushroomId]
                })
            }
        }

        //Do we have a winning team (player or enemy)? Null if not.
        const winner = this.getWinningTeam();
        if(winner == "player"){
            await this.onNewEvent({
                type: "textMessage",
                text: `You've won!`
            })
            this.onWinner(winner);
            return;
        } else if(winner == "enemy"){
            await this.onNewEvent({
                type: "textMessage",
                text: `You've lost!`
            })
            this.onWinner(winner);
            return;
        }

        //We have a dead target, but still no winner, so bring in a replacement
        if (targetDead) {
            const replacement = await this.onNewEvent({
                type: "replacementMenu",
                team: submission.target.team
            })
            await this.onNewEvent({
                type: "replace",
                replacement: replacement
            })
            await this.onNewEvent({
                type: "textMessage",
                text: `${replacement.name} appears!`
            })
        }

        //Check for post events
        //Do things after our original turn submission
        const postEvents = caster.getPostEvents();
        for(let i=0; i < postEvents.length; i++) {
            const event = {
                ...postEvents[i],
                submission,
                action: submission.action,
                caster,
                target: submission.target,
            }
            await this.onNewEvent(event);
        }

        //Check for status expire
        const expiredEvent = caster.decrementStatus();
        if(expiredEvent) {
            await this.onNewEvent(expiredEvent);
        }

        this.nextTurn();
    }

    nextTurn() {
        //Change the team after turn is done
        this.currentTeam = this.currentTeam === "player" ? "enemy" : "player";
        this.turn();
    }

    getWinningTeam() {
        let aliveTeams = {};
        Object.values(this.battle.combatants).forEach(c => {
            if(c.hp > 0) {
                aliveTeams[c.team] = true;
            }
        })
        if(!aliveTeams["player"]) { return "enemy" }
        if(!aliveTeams["enemy"]) {return "player"}
        return null;
    }

    async init() {
        await this.onNewEvent({
            type: "textMessage",
            text: `${this.battle.enemy.name} wants to throw down!`
        })

        //Start the first turn!
        this.turn();
    }
}

