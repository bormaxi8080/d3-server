/**
 * Утилита для примешивания одного объекта к другому.
 * Если нужно особое примешивание, то можно задать объект,
 * непосредственно занимающийся примешиванием.
 */

/**
 * Осуществить обычное смешивание (когда все свойства одного
 * объекта становятся свойствами другого)
 *
 * @param target    {Object}    Объект, к которому производится примешивание
 * @param mixer     {Object}    Объект, из которого берутся поля для примешивания
 */
exports.mix = function(target, mixer, force)
{
    for (var prop in mixer)
    {
      if (!force) {
          if (prop in target) throw new Error("Unable to mix - property already exists!");
      }
        target[prop] = mixer[prop];
    }
};