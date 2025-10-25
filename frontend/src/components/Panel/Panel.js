import classNames from "classnames";

function Panel({children, className, ...rest}){

    // le classi base/minime per il panel e faccio il merge con eventuali classi passate al pannello
    const finalClassNames = classNames('border rounded p-3 shadow bg-white w-full', className);


    return (
        <div className={finalClassNames} {...rest}>
            {children}
        </div>
    );
 
}

export default Panel;
