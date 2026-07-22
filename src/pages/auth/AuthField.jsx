const AuthField = (props) => {

    const {inputType, placeholder, labelText} = props;

    return (
    <div className="form-group">

        <label>{labelText}</label>

        <input
            type={inputType}
            placeholder={placeholder}
        />

    </div>
    )
}

export default AuthField;