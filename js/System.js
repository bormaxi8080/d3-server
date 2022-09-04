var System = function() {
    this.is_int = function(value) {
        if ((undefined === value) || (null === value) || (false === value)) {
            return false;
        }
        return value % 1 == 0;
    }

    this.is_boolean = function(value) {
        return typeof value === 'boolean';
    }

    this.is_string = function(value) {
        return typeof value === 'string';
    }

    this.is_array = function(value) {
        return typeof(value)=='object' && (value instanceof Array);
    }

    this.is_object = function(value) {
        return typeof value === 'object' && (value instanceof Object);
    }

    this.is_not_empty_object = function(value) {
        if (this.is_object(value)) {
            for (var key in value) return true;
        }
        return false;
    }

    this.is_empty_object = function(value) {
        if (this.is_object(value)) return !this.is_not_empty_object(value);
        return false;
    }

    this.check_boolean = function(value, info) {
        if (!this.is_boolean(value)) throw new Error((info?info+'. ':'')+"Значение должно быть типа Boolean.");
    }

    this.check_key = function(args, key, info) {
        if( !this.is_object(args) ) throw new Error( "Необходимо передать объект, в котором проверяется ключ " + key +"." );
        if( key == undefined ) throw new Error( "Необходимо передать ключ, который проверяется в объекте " + args + "." );
        if( !(key in args)) throw new AccessProtocolError( "Отсутствует параметр " + (info?info:key) + "." );
    }

    this.check_number = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );

        number = parseFloat(number);
        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );
    }

    this.check_number_positive = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );

        number = parseFloat(number);
        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );
        if (number <= 0) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше или равно 0." );
    }

    this.check_number_positive_or_0 = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );

        number = parseFloat(number);
        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть числом." );
        if (number < 0) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше 0." );
    }

    this.check_int_positive = function(number, info) {
        if (!this.is_int(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        if (number < 1) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше 1." );
    }

    this.check_int_positive_or_0 = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        number = parseFloat(number);

        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        if (!this.is_int(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть натуральным числом." );
        if (number < 0) throw new AccessProtocolError( (info?info+'. ':'')+"Значение не может быть меньше 0." );
    }

    this.check_int = function(number, info) {
        if (this.is_array(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть целым числом." );
        number = parseFloat(number);

        if (isNaN(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть целым числом." );
        if (!this.is_int(number)) throw new AccessProtocolError( (info?info+'. ':'')+"Значение должно быть целым числом." );
    }

    this.check_array = function(list, info) {
        if (!this.is_array(list)) throw new AccessProtocolError( (info?info+'. ': '')+"Значение должно быть массивом.")
    }

    this.check_object = function(obj, info) {
        if (!this.is_object(obj)) throw new AccessProtocolError( (info?info+'. ': '')+"Значение должно быть объектом.")
    }

    this.check_string = function(string, info) {
        if (!this.is_string(string)) throw new AccessProtocolError( (info?info+'. ': '')+"Значение должно быть строкой.")
    }
}