using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Hive.Converters
{
    public class StackJsonConverter : JsonConverterFactory
    {
        public override bool CanConvert(Type typeToConvert)
        {
            return typeToConvert.IsGenericType && typeToConvert.GetGenericTypeDefinition() == typeof(Stack<>);
        }

        public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
        {
            Debug.Assert(typeToConvert.IsGenericType && typeToConvert.GetGenericTypeDefinition() == typeof(Stack<>));

            Type elementType = typeToConvert.GetGenericArguments()[0];

            JsonConverter converter = (JsonConverter) Activator.CreateInstance(typeof(StackJsonConverter<>).MakeGenericType(elementType), BindingFlags.Instance | BindingFlags.Public, null, null, null)!;

            return converter;
        }
    }

    public class StackJsonConverter<T> : JsonConverter<Stack<T>>
    {
        public override Stack<T> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.StartArray || !reader.Read()) throw new JsonException();

            var elements = new Stack<T>();

            while (reader.TokenType != JsonTokenType.EndArray)
            {
                elements.Push(JsonSerializer.Deserialize<T>(ref reader, options)!);

                reader.Read();
            }

            return new Stack<T>(elements);
        }

        public override void Write(Utf8JsonWriter writer, Stack<T> value, JsonSerializerOptions options)
        {
            writer.WriteStartArray();

            var reversed = value;

            foreach (var item in reversed) JsonSerializer.Serialize(writer, item, options);

            writer.WriteEndArray();
        }
    }
}
