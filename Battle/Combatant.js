class Combatant {
    constructor(config, battle) {
        Object.keys(config).forEach(key => {
            //e.g. hp: 20
            this[key] = config[key];
        })
        this.battle = battle;
    }

    createElement() {

    }

    init() {

    }
}