import Stats from './Stats.js'
import UI from './UI.js'

export default class Debug
{
    static instance

    static getInstance()
    {
        return Debug.instance
    }

    constructor()
    {
        if(Debug.instance)
            return Debug.instance

        Debug.instance = this

        this.active = false

        if(typeof window !== 'undefined' && location.hash === '#debug')
        {
            this.activate()
        }
    }

    async activate()
    {
        if(this.active)
            return
            
        this.active = true

        try {
            this.ui = new UI()
            this.stats = new Stats()
        } catch(e) {
            console.warn('Debug tools not available:', e)
            this.active = false
        }
    }
}
