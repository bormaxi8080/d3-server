var Random = function()
{
    /**
     * Получает случайное число от 0 до 1 (синхронизированно с сервером)
     */
    this.get_random = function() {
        var data = this.generate_from_seed(context.storage.get_property("options.random_seed"));
        context.storage.set_property("options.random_seed", data.next_seed);
        return data.result;
    };

    /**
     * Генерирует число от 0 до 1 на основе переданного сида и следующий сид.
     * Возвращает объект в формате {result: <число>, next_seed: <следующий сид>}
     *
     * @param seed сид для генерации
     */
    this.generate_from_seed = function(seed)
    {
        var next_seed = (seed * 9301 + 49297) % 233280;
        var result = next_seed / 233280.0;
        return {result: result, next_seed: next_seed};
    };
}
