package helper

import (
	"fmt"
	"reflect"
)

func MapToStruct(m interface{}, s interface{}) error {
	r := reflect.ValueOf(m)
	switch reflect.TypeOf(m).Kind() {
	case reflect.Map:
		keys := r.MapKeys()
		for _, k := range keys {
			err := setfield(k.Interface().(string), r.MapIndex(k).Interface(), s)
			if err != nil {
				fmt.Println(err)
				return err
			}
		}
	}

	return nil
}

func setfield(k string, v interface{}, s interface{}) error {
	structValue := reflect.ValueOf(s).Elem()
	structFieldValue := structValue.FieldByName(k)
	if !structFieldValue.IsValid() {
		return fmt.Errorf("No such Field %s", k)
	}
	if !structValue.CanSet() {
		return fmt.Errorf("Cannot Set %s field value", k)
	}
	structFieldType := structFieldValue.Type()
	val := reflect.ValueOf(v)
	if structFieldType != val.Type() {
		return fmt.Errorf("Didn't match type %v in struct with %v in map", structFieldType, val.Type())
	}
	structFieldValue.Set(val)
	return nil

}
