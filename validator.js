//Định nghĩa các rule
function validator(options){
    function getParent(element, selector){
        return element.closest(selector);
    }
    let selectorRules = {}

    function validateInput(inputElement, rule){
        let errorMessage 
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.message)
        let rules = selectorRules[rule.selector]
        for(let i= 0; i < rules.length; i++){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    let isRadioChecked = formElement.querySelector(rule.selector + ':checked');
                    if(isRadioChecked) errorMessage = rules[i](isRadioChecked.value)
                        else errorMessage = rules[i]()
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break
        }
        
        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !!errorMessage
    }
    // Lấy element của fomr càn validate
    let formElement = document.querySelector(options.form);
    if(formElement){
        //Khi sumbmit form
        formElement.onsubmit = function(event){
            isFormValid = true
            event.preventDefault()
            options.rules.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector);        
                let isValid= validateInput(inputElement, rule);
                if(isValid) isFormValid = false;
            })
            //Trường hợp submit với js
            if(isFormValid){
                if (typeof options.onSubmit === 'function'){
                    let enableInput = formElement.querySelectorAll('[name]')
                    let valueInputs = Array.from(enableInput)
                    let formValues = valueInputs.reduce(
                    (values, input)=>
                        {
                            switch(input.type){
                                case 'checkbox':
                                    if(!input.checked) {
                                        values[input.name] = ''
                                        return values
                                    }
                                    if(Array.isArray(values[input.name])) values[input.name].push(input.value)
                                    else values[input.name] = [input.value]
                                    break
                                case 'radio':
                                    if(input.checked) values[input.name] = input.value
                                    break
                                case 'file':
                                    values[input.name] = input.files
                                    break   
                                default:
                                    values[input.name] = input.value
                            }
                            return values;
                        }
                    ,{})
                    options.onSubmit(formValues)
                } //Trường hợp submit với hành vi mặc đinh dùng khi submit theo html không dùng đến js
                else formElement.submit()
            }

        }
        //Xử lí lặp qua các rule và thực hiện các rule của từng seletor
        options.rules.forEach(rule => {
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test);
            }
            else selectorRules[rule.selector] = [rule.test]
            let inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(inputElement => {
                if(inputElement){
                    //Xử lí trường hợp blur khỏi input
                    inputElement.onblur = function(){
                        validateInput(inputElement, rule);
                    }
                    //Xử lí mỗi khi nhập vào input
                    inputElement.oninput = function(){
                        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.message);
                        errorElement.innerText = ''
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                        
                    }
                
                }
            })

            
        })

    }

}

validator.isRequired = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            if (value) {
                for(let i = 0; i < value.length; i++) {
                    if(value[i] !=' ') return undefined
                }
            }
            return  message || 'Please fill in this field'
        }
    }
}

validator.isEmail = function(selector, message){
    return {
        selector: selector,
        test: function(value){
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value)? undefined : message || 'Please enter a valid email address'
        }
    }
}

validator.minLength = function(selector, min, message){
    return {
        selector: selector,
        test: function(value){
            return value.length>= min ? undefined : message ||'Please fill in this field with at least '+ min +' characters'
        }
    }
}
validator.isConfirmed = function(selector, confirmValue, message){
    return {
        selector: selector,
        test: function(value){
        return value === confirmValue() ? undefined : message ||'Please confirm your data'
        }
    }
}