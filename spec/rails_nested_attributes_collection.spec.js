/**
*
*
*   Testing the RailsNestedAttributesCollectionMixin
*
*/
describe("RailsNestedAttributesCollectionMixin", function() {

  var collection,
      GenericCollection,
      existingModels  = [{id:1, name:'one'},{id:2, name:'two'},{id:3, name:'three'}],
      newModels       = [{name:'one'},{name:'two'},{name:'three'}],
      modelCount      = newModels.length + existingModels.length;

  beforeEach(function() {
    GenericCollection = Backbone.RailsNestedAttributesCollection.extend();
    collection = new GenericCollection();
  });

  describe("attributes", function() {

    // we're overriding _reset, so ensure it's super is being called
    it("should behave like a normal collection", function() {
      spyOn(Backbone.Collection.prototype, '_reset');
      collection = new GenericCollection();

      expect(Backbone.Collection.prototype._reset).toHaveBeenCalled();
    });

    it("should have a deleted collection", function() {
      expect(collection.deleted.length).toEqual(0);
    });

  });

  describe("destroying new model", function() {

    beforeEach(function() {
      collection.add(newModels);
    });

    it("should not add to the deleted collection", function() {
      collection.remove(collection.at(0));
      expect(collection.deleted.length).toEqual(0);
    });
  });

  describe("destroying existing model", function() {

    beforeEach(function() {
      collection.add(existingModels);
    });

    it("should add to the deleted collection", function() {
      collection.remove(collection.at(0));
      expect(collection.deleted.length).toEqual(1);
      collection.remove(collection.at(0));
      expect(collection.deleted.length).toEqual(2);
    });

    it("should set a _destroy attribute on the model", function() {
      collection.remove(collection.at(0));
      expect(collection.deleted.at(0).get('_destroy')).toBeTruthy();
    });
  });

  describe("serialization", function() {

    beforeEach(function() {
      collection.add(newModels);
      collection.add(existingModels);
    });

    it("should include new and existing models", function() {
      expect(collection.toJSON().length).toEqual(modelCount);
    });

    it("should include deleted existing models", function() {
      collection.remove( collection.last() );
      expect(collection.toJSON().length).toEqual(modelCount);
    });

    it("should not include deleted new models", function() {
      collection.remove( collection.first() );
      expect(collection.toJSON().length).toEqual(modelCount - 1);
    });
  });

  describe("#reset", function() {

    beforeEach(function() {
      collection.add(existingModels);
      collection.remove(collection.last());
    });

    // if our old deleted collection is still bound to the main collection,
    // it will keep getting deleted models and never be GC'd (memory leak)
    it("should remove bindings to the deleted collection", function() {
      var deletedCollection = collection.deleted,
          deletedLength     = deletedCollection.length;

      collection.reset([{id:4, name:'four'}]);
      collection.remove(collection.last());

      expect(deletedCollection.length).toEqual(deletedLength);
    });

    it("should reset the deleted collection", function(){
      collection.reset();
      expect(collection.deleted.length).toEqual(0);
    });
  });
});