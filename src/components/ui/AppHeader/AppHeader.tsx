import React from 'react';
import type { FC } from 'react';
import type { TAppHeader } from './types';
import { Button, Image } from "antd";
import logo from '../../../images/logo.png';
export const AppHeader: FC<TAppHeader> = ({ username }) => {
    return (
        <header className='p-3 container'>
            <nav className='row border-bottom px-2 align-items-center'>
                <div className='gap-4 col d-flex justify-content-start'>
                    <p className="text-center m-0">Chat</p>
                    <p className="text-center m-0">Map</p>
                </div>
                <div className='col-auto'>
                    <Image preview={false} src={logo} alt="logo" style={{ maxWidth: '100px' }} />
                </div>
                <div className='gap-4 col d-flex justify-content-end align-items-center'> 
                    {username ? (
                        <>
                        <p className="text-center m-0">{username}</p>
                        <Button type="default" >Log out</Button>
                        </>
                    ) : (
                        <>
                        <Button type="default" >Log in</Button>
                        <Button type="default" >Sign up</Button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};
