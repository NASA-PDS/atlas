import React from 'react'

const Error404 = () => (
    <div
        style={{
            position: 'absolute',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            background: 'var(--color-d)',
            userSelect: 'none',
        }}
    >
        <div
            style={{
                fontWeight: 'bold',
                fontSize: '120px',
                position: 'absolute',
                top: '50%',
                left: '50%',
                color: 'var(--color-trans-2)',
                transform: 'translateX(-50%) translateY(-50%)',
            }}
        >
            Page not found
        </div>
    </div>
)

export default Error404
