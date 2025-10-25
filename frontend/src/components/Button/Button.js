import PropTypes from "prop-types";
import classnames from "classnames";

function Button({
    children,
    primary,
    secondary,
    success,
    warning,
    danger,
    outline, rounded,
    className,
    ...rest
}) {

    
        const classes = classnames(
            className,
            'flex items-center px-3 py-1.5 border',
            {
                'border-blue-500 bg-blue-500': primary,
                'border-gray-500 bg-gray-500': secondary,
                'border-green-500 bg-green-500': success,
                'border-yellow-500 bg-yellow-500': warning,
                'border-red-500 bg-red-500': danger,
                'rounded-full': rounded,
                // 'bg-white': outline,
                'bg-transparent': outline,
                'text-white': !outline && primary,
                'text-white': !outline && secondary,
                'text-white': !outline && success,
                'text-white': !outline && warning,
                'text-white': !outline && danger,
                
                'text-blue-500': outline && primary,
                'text-gray-900': outline && secondary,
                'text-green-500': outline && success,
                'text-yellow-400': outline && warning,
                'text-red-500': outline && danger
            },
            
        );

    return (
        <button 
            className={classes}
            {...rest}
        >{children}</button>
    )


}


Button.propTypes = {

    // una customProp perchè voglio una regola che mi da avlida una sola proprietà delle 4 possibili
    checkVariationvalue: ({primary, secondary,success, warning,danger}) => {

        const count = Number(!!primary) + Number(!!secondary) + Number(!!success) + Number(!!warning) + Number(!!danger);

        if(count > 1) {
            return new Error('Only one value of variation');
        }

    }

}

export default Button;