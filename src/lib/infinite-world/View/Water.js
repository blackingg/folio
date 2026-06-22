import { Mesh, MeshBasicMaterial, PlaneGeometry, DoubleSide } from 'three';

import View from './View.js'
import State from '../State/State.js'

export default class Water
{
    constructor()
    {
        this.view = View.getInstance()
        this.state = State.getInstance()
        this.scene = this.view.scene

        this.mesh = new Mesh(
            new PlaneGeometry(1000, 1000),
            new MeshBasicMaterial({ 
                color: '#1d3456',
                transparent: true,
                opacity: 0.7,
                side: DoubleSide
            })
        )
        this.mesh.geometry.rotateX(- Math.PI * 0.5)
        this.scene.add(this.mesh)
    }

    update()
    {
        const playerState = this.state.player

        this.mesh.position.set(
            playerState.position.current[0],
            0,
            playerState.position.current[2]
        )
    }
}