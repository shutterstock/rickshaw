const Rickshaw = require('../rickshaw');

describe('Rickshaw.Graph.Ajax', () => {
  test('makes ajax request with correct URL', () => {
    const jQuery = { ajax: jest.fn() };
    global.jQuery = jQuery;

    const dataURL = 'http://example.com/data';
    const ajax = new Rickshaw.Graph.Ajax({
      dataURL: dataURL,
      element: document.createElement('div')
    });

    expect(jQuery.ajax).toHaveBeenCalledWith({
      url: dataURL,
      dataType: 'json',
      success: expect.any(Function),
      error: expect.any(Function)
    });

    delete global.jQuery;
  });

  test('transforms data using onData callback', () => {
    const jQuery = { ajax: jest.fn() };
    global.jQuery = jQuery;

    const inputData = [{ data: [{ x: 1, y: 2 }], name: 'series1' }];
    const element = document.createElement('div');
    
    const ajax = new Rickshaw.Graph.Ajax({
      dataURL: 'http://example.com/data',
      element: element,
      width: 50,
      height: 50,
      onData: (data) => data.map(series => ({
        name: series.name,
        data: series.data.map(d => ({ x: d.x, y: d.y * 2 }))
      }))
    });

    // Get the success callback and call it with test data
    const successCallback = jQuery.ajax.mock.calls[0][0].success;
    successCallback(inputData);

    // The real graph should have been created and rendered
    expect(element.querySelector('svg')).not.toBeNull();

    delete global.jQuery;
  });

  test('calls onError callback on ajax failure', () => {
    const jQuery = { ajax: jest.fn() };
    global.jQuery = jQuery;
    
    const onError = jest.fn();
    const ajax = new Rickshaw.Graph.Ajax({
      dataURL: 'http://example.com/data',
      element: document.createElement('div'),
      onError: onError
    });

    // Get the error callback and call it
    const errorCallback = jQuery.ajax.mock.calls[0][0].error;
    errorCallback();

    expect(onError).toHaveBeenCalled();

    delete global.jQuery;
  });

  test('splices series data correctly', () => {
    const jQuery = { ajax: jest.fn() };
    global.jQuery = jQuery;

    const existingSeries = [
      { name: 'series1', data: [{ x: 1, y: 1 }] },
      { name: 'series2', data: [{ x: 1, y: 2 }] }
    ];

    const element = document.createElement('div');
    const ajax = new Rickshaw.Graph.Ajax({
      dataURL: 'http://example.com/data',
      element: element,
      width: 50,
      height: 50,
      series: existingSeries
    });

    const newData = [
      { name: 'series1', data: [{ x: 2, y: 3 }] },
      { name: 'series2', data: [{ x: 2, y: 4 }] }
    ];

    // Get the success callback and call it with test data
    const successCallback = jQuery.ajax.mock.calls[0][0].success;
    successCallback(newData);

    // The graph should have been created and rendered with the new data
    expect(element.querySelector('svg')).not.toBeNull();

    delete global.jQuery;
  });

  test('throws error if series or data missing key/name', () => {
    const jQuery = { ajax: jest.fn() };
    global.jQuery = jQuery;
    
    const ajax = new Rickshaw.Graph.Ajax({
      dataURL: 'http://example.com/data',
      element: document.createElement('div'),
      series: [{ data: [] }]
    });

    const successCallback = jQuery.ajax.mock.calls[0][0].success;
    const invalidData = [{ data: [{ x: 1, y: 1 }] }];

    expect(() => {
      successCallback(invalidData);
    }).toThrow('series needs a key or a name');

    delete global.jQuery;
  });
});
