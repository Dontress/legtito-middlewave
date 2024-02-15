import {
    Column,
    Entity, JoinColumn, OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import bcrypt from 'bcryptjs';

import { SharepointConnection } from './sharepointConnection';

@Entity()
export class LegitoConnection {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ nullable: false, unique: true, length: 20 })
    apiKey!: string;

    @Column({ nullable: false, unique: true, length: 255 })
    domain!: string;

    @Column({ nullable: false })
    hashSecret!: string;

    @Column({ nullable: false })
    salt!: string;

    @OneToOne(() => SharepointConnection)
    @JoinColumn()
    sharepointConnection!: SharepointConnection;

    setSecret(password: string) {
        this.salt = bcrypt.genSaltSync(12);
        this.hashSecret = bcrypt.hashSync(password, this.salt);
    }

    verifySecret(password: string) {
        const hash = bcrypt.hashSync(password, this.salt);
        return hash === this.hashSecret;
    }
}