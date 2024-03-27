import {
    Column,
    Entity, OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { LegitoConnection } from './legitoConnection';

@Entity()
export class SharepointConnection {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false, unique: false, length: 255 })
    tenantId!: string;

    @Column({ nullable: false, unique: false, length: 255 })
    clientId!: string;

    @Column({ nullable: false })
    clientSecret!: string;

    @OneToOne(() => LegitoConnection, { nullable: true })
    legitoConnection!: LegitoConnection;
}