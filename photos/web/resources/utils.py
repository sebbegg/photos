from flask_restplus import fields
import sqlalchemy.sql.sqltypes as sa

SQL_TYPE_TO_JSON = {
    sa.BigInteger: fields.Integer,
    sa.Integer: fields.Integer,
    sa.JSON: fields.Raw,
    sa.DateTime: fields.DateTime,
    sa.String: fields.String,
}


def sqla_resource_fields(cls):

    fields = {}
    col_attrs = cls.__mapper__.column_attrs
    for key, prop in col_attrs.items():
        col_type = prop.columns[0].type
        if isinstance(col_type, sa.Variant):
            col_type = col_type.impl
        fields[key] = SQL_TYPE_TO_JSON[type(col_type)]

    return fields
