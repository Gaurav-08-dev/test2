import React, { useState, useEffect } from "react";
import './styles.scss';

const key = [...Array(26)].map((_, i) => String.fromCharCode(i + 65).toUpperCase());

const backgroundColor = [
    '#986f0b', '#7a7574', '#986f0b', '#a4262c', '#8764b8', '#4f6bed',
    '#881798', '#4a154a', '#8764b8', '#7a7574', '#881798', '#4f6bed',
    '#8764b8', '#4f6bed', '#a4262c', '#004e8c', '#986f0b', '#ca5010',
    '#4f6bed', '#038387', '#7a7574', '#c239b3', '#881798', '#8764b8',
    '#986f0b', '#7a7574'
];

const colorsList = [];
for (let i = 0; i < key.length; i++) {
    let obj = { key: key[i], fontColor: '#FFF', backgroundColor: backgroundColor[i] }
    colorsList.push(obj);
}

export default function Avatar({
    imgSrc = '',
    firstName,
    lastName = undefined,
    fontSize = '14',
    alt = 'profile_image',
    height = '30',
    width = '30',
    borderRadius = '50%'
}) {

    const [src, setSrc] = useState(imgSrc);
    lastName = lastName === undefined ? '' : lastName;
    const initials = ((firstName ? firstName.charAt(0) : '').toUpperCase() + (lastName ? lastName.charAt(0) : '')).toUpperCase();

    const [color, setColor] = useState({ fontColor: '#000', backgroundColor: '#FFF' });

    const validateProps = (firstName) => {
        // validate required props here before doing anything
        if (!firstName) {
            throw Error('firstName is mandatory');
        }
    }

    useEffect(() => {
        validateProps(firstName);
        setSrc(imgSrc);
        let [colour] = colorsList.filter(c => c.key === initials.charAt(0));
        colour = !colour ? { key: '', fontColor: '#FFF', backgroundColor: '#c239b3' } : colour;
        setColor({ fontColor: colour.fontColor, backgroundColor: colour.backgroundColor });

    }, [initials, imgSrc]);

    return (
        <>
            {
                src ? <img
                    src={src}
                    alt={alt}
                    onError={() => setSrc('')}
                    style={{ height: height, width: width, borderRadius: borderRadius }}
                    className='avatar-img'
                /> : <div
                    className='initial'
                    style={{
                        height: height,
                        width: width,
                        minWidth: width,
                        fontSize: fontSize,
                        color: color.fontColor,
                        backgroundColor: color.backgroundColor,
                        borderRadius: borderRadius
                    }}
                >
                    {initials}
                </div>
            }
        </>
    );
}