# Changes Made

I had to rewrite the section "codes" of many cars/XX.yml since many of them contained duplicated mapping keys for the "codes" field,
Also documented this shortly in the dbmuxev/doc/car.yml

In nodes/AEE2024.full.yml I removed one of these two (nearly the same)

```yml
CDPL:
  bus:
    - 'LS.CAR'
  id:
    LS: 0x0A
  name:
    en: 'Luminosity and rain sensor'
    fr: 'Capteur De Pluie et de Luminosite'


CDPL:
  bus:
    - 'LS.CAR'
  id:
    LS: 0x0A
  name:
    en: 'Rain and Light Sensor'
    fr: 'Capteur de Pluie et Luminosite'
```